package controllers

import (
	"bytes"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"log/slog"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/owulveryck/onnx-go"
	"github.com/owulveryck/onnx-go/backend/x/gorgonnx"
	"gorgonia.org/tensor"
)

// DetectionController handles the detection requests
type DetectionController struct{}

// NewDetectionController creates a new DetectionController
func NewDetectionController() *DetectionController {
	return &DetectionController{}
}

// Detect performs object detection on the given image
func (ctrl *DetectionController) Detect(c *gin.Context) {
	file, _, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "image not provided"})
		return
	}
	defer file.Close()

	// Read the image data
	data, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read image"})
		return
	}

	// Decode the image
	img, _, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode image"})
		return
	}

	// TODO: Preprocess the image and convert it to a tensor
	// This part is highly dependent on the model's expected input format.
	// For a typical YOLO model, this would involve resizing to 640x640,
	// normalizing pixel values (e.g., to [0, 1]), and arranging
	// the data in NCHW format.
	inputTensor := tensor.New(tensor.WithShape(1, 3, 640, 640), tensor.Of(tensor.Float32))

	// Create a backend
	backend := gorgonnx.NewGraph()
	// Create a model
	model := onnx.NewModel(backend)

	// read the onnx model
	b, err := os.ReadFile("models/onnx/yolomodel.onnx")
	if err != nil {
		slog.Error("cannot read model", slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot read model"})
		return
	}
	// Decode the model
	err = model.Decode(bytes.NewReader(b))
	if err != nil {
		slog.Error("cannot decode model", slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot decode model"})
		return
	}

	// Set the model's input
	err = model.SetInput(0, inputTensor)
	if err != nil {
		slog.Error("cannot set input", slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot set input"})
		return
	}

	// Run the model
	err = backend.Run()
	if err != nil {
		slog.Error("cannot run the model", slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot run the model"})
		return
	}

	// Get the output
	output, err := model.GetOutputTensors()
	if err != nil {
		slog.Error("cannot get output", slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot get output"})
		return
	}

	// TODO: Postprocess the output tensor to extract meaningful information
	// (e.g., bounding boxes, class labels, confidence scores).
	// The structure of the output tensor depends on the model.

	c.JSON(http.StatusOK, gin.H{"message": "detection successful", "output": output})
}
