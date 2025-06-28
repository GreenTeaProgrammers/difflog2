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

func TestNewDetectionController_FailsWithInvalidModel(t *testing.T) {
	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	// Mock the ONNX model file by creating an empty, invalid file.
	modelDir := "backend/models/onnx"
	modelPath := filepath.Join(modelDir, "yolomodel.onnx")
	
	// Ensure the directory exists.
	err := os.MkdirAll(modelDir, 0755)
	assert.NoError(t, err)

	// Create an empty file.
	dummyFile, err := os.Create(modelPath)
	assert.NoError(t, err)
	dummyFile.Close()

	// Defer cleanup of the created dummy file and directory.
	defer func() {
		os.Remove(modelPath)
		os.Remove(modelDir)
	}()

	// Controller creation should fail because the model file is invalid (empty).
	_, err = NewDetectionController()
	assert.Error(t, err, "Expected an error when creating a controller with an invalid model file")
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
	assert.Len(t, results, 1, "Expected 1 result after NMS")
	if len(results) > 0 {
		assert.Equal(t, cocoClasses[classIndex], results[0].Class, "Class name should match")
		assert.InDelta(t, 0.9, results[0].Confidence, 0.001, "Confidence should be close to 0.9")
		// Bounding box calculation:
		// imageWidth=640, imageHeight=640, modelWidth=640, modelHeight=640
		// cx=320, cy=320, w=100, h=100
		// x1 = (320 - 100/2) * 640 / 640 = 270
		// y1 = (320 - 100/2) * 640 / 640 = 270
		// x2 = (320 + 100/2) * 640 / 640 = 370
		// y2 = (320 + 100/2) * 640 / 640 = 370
		expectedBox := []int{270, 270, 370, 370}
		assert.Equal(t, expectedBox, results[0].BoundingBox, "Bounding box coordinates should be correct")
	}
}
