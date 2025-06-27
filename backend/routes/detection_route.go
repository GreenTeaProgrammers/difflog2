package routes

import (
	"github.com/GreenTeaProgrammers/difflog2/controllers"
	"github.com/gin-gonic/gin"
)

// RegisterDetectionRoutes registers the detection routes
func RegisterDetectionRoutes(r *gin.Engine, detectionController *controllers.DetectionController) {
	r.POST("/detect", detectionController.Detect)
}
