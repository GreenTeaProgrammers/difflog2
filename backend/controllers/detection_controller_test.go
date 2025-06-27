package controllers

import (
	"bytes"
	"encoding/json"
	"image"
	"image/png"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorgonia.org/tensor"
)

// createTestImage creates a dummy PNG image for testing purposes.
func createTestImage(t *testing.T) *bytes.Buffer {
	img := image.NewRGBA(image.Rect(0, 0, 100, 50))
	buf := new(bytes.Buffer)
	err := png.Encode(buf, img)
	if err != nil {
		t.Fatalf("Failed to create test image: %v", err)
	}
	return buf
}

func TestDetectionController_Detect(t *testing.T) {
	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	// Setup router
	router := gin.Default()
	ctrl := NewDetectionController()
	router.POST("/detect", ctrl.Detect)

	// Create a dummy image for the request body
	imageBuf := createTestImage(t)

	// Create a multipart writer
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("image", "test.png")
	assert.NoError(t, err)
	_, err = io.Copy(part, imageBuf)
	assert.NoError(t, err)
	err = writer.Close()
	assert.NoError(t, err)

	// Mock the ONNX model file
	// The test doesn't actually run the model, but it needs to read the file.
	// Let's create a dummy model file.
	modelDir := "backend/models/onnx"
	modelPath := filepath.Join(modelDir, "yolomodel.onnx")
	if _, err := os.Stat(modelDir); os.IsNotExist(err) {
		os.MkdirAll(modelDir, 0755)
	}
	dummyFile, err := os.Create(modelPath)
	if err != nil {
		// If we are in the backend directory, the path should be relative
		modelDir = "../models/onnx"
		modelPath = filepath.Join(modelDir, "yolomodel.onnx")
		if _, err := os.Stat(modelDir); os.IsNotExist(err) {
			os.MkdirAll(modelDir, 0755)
		}
		dummyFile, err = os.Create(modelPath)
		assert.NoError(t, err)
	}
	dummyFile.Close()
	defer os.Remove(modelPath)
	defer os.RemoveAll("backend") // Clean up created directory structure
	defer os.RemoveAll("../models")

	// Create the request
	req, err := http.NewRequest(http.MethodPost, "/detect", body)
	assert.NoError(t, err)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	// Create a response recorder
	w := httptest.NewRecorder()

	// Perform the request
	router.ServeHTTP(w, req)

	// Assert the response
	// Since the model is a dummy file, the backend will fail, which is expected.
	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestPostprocess(t *testing.T) {
	// Create a dummy output tensor with shape (1, 84, 10)
	// 84 = 4 (bbox) + 80 (classes)
	// 10 = number of proposals
	numProposals := 10
	numClasses := 80
	shape := []int{1, numClasses + 4, numProposals}
	data := make([]float32, 1*(numClasses+4)*numProposals)

	// Create one "strong" detection
	propIndex := 3
	offset := propIndex * (numClasses + 4)
	data[offset] = 320.0   // cx
	data[offset+1] = 320.0 // cy
	data[offset+2] = 100.0 // w
	data[offset+3] = 100.0 // h
	// class scores
	classIndex := 5
	data[offset+4+classIndex] = 0.9 // confidence

	// Create another detection that should be suppressed by NMS
	propIndex2 := 7
	offset2 := propIndex2 * (numClasses + 4)
	data[offset2] = 325.0  // cx
	data[offset2+1] = 325.0// cy
	data[offset2+2] = 100.0// w
	data[offset2+3] = 100.0// h
	classIndex2 := 5
	data[offset2+4+classIndex2] = 0.85 // confidence

	dummyTensor := tensor.New(tensor.WithShape(shape...), tensor.WithBacking(data))
	outputTensors := []tensor.Tensor{dummyTensor}

	results := postprocess(outputTensors, 640, 640)

	// We expect 1 result after NMS
	assert.Len(t, results, 1)
	if len(results) > 0 {
		assert.Equal(t, cocoClasses[classIndex], results[0].Class)
		assert.InDelta(t, 0.9, results[0].Confidence, 0.001)
		// Bounding box: cx,cy,w,h = 320,320,100,100 -> x1,y1,x2,y2 = 270,270,370,370
		expectedBox := []int{270, 270, 370, 370}
		assert.Equal(t, expectedBox, results[0].BoundingBox)
	}
}
