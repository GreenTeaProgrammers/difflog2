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
	"sort"

	"github.com/nfnt/resize"
	"gorgonia.org/tensor"
)

const (
	modelWidth  = 640
	modelHeight = 640
	confThreshold = 0.5
	iouThreshold  = 0.4
)

var cocoClasses = []string{
	"person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light",
	"fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow",
	"elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee",
	"skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard",
	"tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
	"sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch",
	"potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone",
	"microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear",
	"hair drier", "toothbrush",
}

// DetectionResult defines the structure for a single detection
type DetectionResult struct {
	BoundingBox []int   `json:"bounding_box"` // [x1, y1, x2, y2]
	Class       string  `json:"class"`
	Confidence  float32 `json:"confidence"`
}


// DetectionController handles the detection requests
type DetectionController struct {
	model   *onnx.Model
	backend *gorgonnx.Graph
}

// NewDetectionController creates a new DetectionController and loads the model
func NewDetectionController() (*DetectionController, error) {
	// Create a backend
	backend := gorgonnx.NewGraph()
	// Create a model
	model := onnx.NewModel(backend)

	// read the onnx model
	b, err := os.ReadFile("backend/models/onnx/yolomodel.onnx")
	if err != nil {
		slog.Error("cannot read model", slog.Any("error", err))
		return nil, err
	}
	// Decode the model
	err = model.UnmarshalBinary(b)
	if err != nil {
		slog.Error("cannot decode model", slog.Any("error", err))
		return nil, err
	}

	// The model is implicitly associated with the backend,
	// so no explicit SetGraph call is needed in this version.

	return &DetectionController{
		model:   model,
		backend: backend,
	}, nil
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

	// Preprocess the image
	resizedImg := resize.Resize(modelWidth, modelHeight, img, resize.Lanczos3)
	bounds := resizedImg.Bounds()
	width, height := bounds.Max.X, bounds.Max.Y

	// Convert image to NCHW tensor
	inputData := make([]float32, 1*3*height*width)
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			r, g, b, _ := resizedImg.At(x, y).RGBA()
			// Normalize to [0, 1]
			inputData[y*width+x] = float32(r>>8) / 255.0
			inputData[height*width+y*width+x] = float32(g>>8) / 255.0
			inputData[2*height*width+y*width+x] = float32(b>>8) / 255.0
		}
	}

	inputTensor := tensor.New(tensor.WithShape(1, 3, height, width), tensor.WithBacking(inputData))

	// Set the model's input
	err = ctrl.model.SetInput(0, inputTensor)
	if err != nil {
		slog.Error("cannot set input", slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot set input"})
		return
	}

	// Run the model
	err = ctrl.backend.Run()
	if err != nil {
		slog.Error("cannot run the model", slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot run the model"})
		return
	}

	// Get the output
	output, err := ctrl.model.GetOutputTensors()
	if err != nil {
		slog.Error("cannot get output", slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot get output"})
		return
	}

	// Postprocess the output tensor to extract bounding boxes, class labels, and confidence scores.
	results := postprocess(output, int(img.Bounds().Dx()), int(img.Bounds().Dy()))

	c.JSON(http.StatusOK, gin.H{"message": "detection successful", "results": results})
}

// postprocess parses the output from the YOLO model
func postprocess(outputTensors []tensor.Tensor, imageWidth, imageHeight int) []DetectionResult {
	if len(outputTensors) == 0 {
		return nil
	}
	output, ok := outputTensors[0].(*tensor.Dense) // Assuming the first output tensor contains the detections
	if !ok {
		slog.Error("failed to assert output tensor type")
		return nil
	}

	// The output shape is typically (1, 84, 8400) for YOLOv8 with 80 classes.
	// 84 = 4 (bbox) + 80 (class scores)
	// 8400 = number of proposals
	// We need to transpose it to (1, 8400, 84) to process each proposal
	// The Transpose method in this version of gorgonia/tensor might not support axes.
	// We will perform a manual transpose.
	shape := output.Shape()
	if len(shape) != 3 {
		slog.Error("unexpected output tensor shape")
		return nil
	}
	b, c, d := shape[0], shape[1], shape[2]
	
	transposedData := make([]float32, len(output.Data().([]float32)))
	oldData := output.Data().([]float32)

	for i := 0; i < b; i++ {
		for j := 0; j < c; j++ {
			for k := 0; k < d; k++ {
				// old index: i*c*d + j*d + k
				// new index for (0, 2, 1) transpose: i*d*c + k*c + j
				transposedData[i*d*c+k*c+j] = oldData[i*c*d+j*d+k]
			}
		}
	}
	transposed := tensor.New(tensor.WithShape(b, d, c), tensor.WithBacking(transposedData))

	shape = transposed.Shape()
	numProposals := shape[1]
	numClasses := shape[2] - 4

	var detections []DetectionResult

	for i := 0; i < numProposals; i++ {
		maxConf := float32(0.0)
		maxIdx := -1
		// First 4 values are bbox, rest are class scores
		for j := 0; j < numClasses; j++ {
			score, err := transposed.At(0, i, j+4)
			if err != nil {
				continue // Should not happen
			}
			if score.(float32) > maxConf {
				maxConf = score.(float32)
				maxIdx = j
			}
		}

		if maxConf > confThreshold {
			cx, _ := transposed.At(0, i, 0)
			cy, _ := transposed.At(0, i, 1)
			w, _ := transposed.At(0, i, 2)
			h, _ := transposed.At(0, i, 3)

			// Scale bounding box to original image size
			x1 := int((cx.(float32) - w.(float32)/2) * float32(imageWidth) / modelWidth)
			y1 := int((cy.(float32) - h.(float32)/2) * float32(imageHeight) / modelHeight)
			x2 := int((cx.(float32) + w.(float32)/2) * float32(imageWidth) / modelWidth)
			y2 := int((cy.(float32) + h.(float32)/2) * float32(imageHeight) / modelHeight)

            className := "unknown"
            if maxIdx >= 0 && maxIdx < len(cocoClasses) {
                className = cocoClasses[maxIdx]
            }

            detections = append(detections, DetectionResult{
                BoundingBox: []int{x1, y1, x2, y2},
                Class:       className,
                Confidence:  maxConf,
            })
        }
    }

    return nonMaxSuppression(detections)
}

// nonMaxSuppression filters detections based on Intersection over Union (IoU)
func nonMaxSuppression(detections []DetectionResult) []DetectionResult {
    if len(detections) == 0 {
        return nil
    }

    // Sort detections by confidence in descending order
    sort.Slice(detections, func(i, j int) bool {
        return detections[i].Confidence > detections[j].Confidence
    })

    var results []DetectionResult
    for i := 0; i < len(detections); i++ {
        isMax := true
        for j := 0; j < len(results); j++ {
            iou := intersectionOverUnion(detections[i].BoundingBox, results[j].BoundingBox)
            if iou > iouThreshold {
                isMax = false
                break
            }
        }
        if isMax {
            results = append(results, detections[i])
        }
    }
    return results
}

// intersectionOverUnion calculates the IoU between two bounding boxes
func intersectionOverUnion(boxA, boxB []int) float32 {
    xA := max(boxA[0], boxB[0])
    yA := max(boxA[1], boxB[1])
    xB := min(boxA[2], boxB[2])
    yB := min(boxA[3], boxB[3])

    interArea := max(0, xB-xA) * max(0, yB-yA)
    boxAArea := (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea := (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])

    iou := float32(interArea) / float32(boxAArea+boxBArea-interArea)
    return iou
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
