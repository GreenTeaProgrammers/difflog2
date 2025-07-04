package routes

import (
	"github.com/GreenTeaProgrammers/difflog2/backend/controllers"
	"github.com/GreenTeaProgrammers/difflog2/backend/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterLocationRoutes(router *gin.Engine, locationController *controllers.LocationController) {
	locationRoutes := router.Group("/locations")
	locationRoutes.Use(middleware.AuthMiddleware())
	{
		locationRoutes.POST("", locationController.CreateLocation)
		locationRoutes.GET("", locationController.GetAllLocations) // Updated route name
		locationRoutes.GET("/:id", locationController.GetLocation)
		locationRoutes.PUT("/:id", locationController.UpdateLocation)
		locationRoutes.DELETE("/:id", locationController.DeleteLocation)
	}
}
