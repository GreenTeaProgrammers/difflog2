package routes

import (
	"github.com/GreenTeaProgrammers/difflog2/locationService/controllers"
	"github.com/GreenTeaProgrammers/difflog2/locationService/models"
	"github.com/gin-gonic/gin"
)

func RegisterLocationRoutes(router *gin.Engine) {
	locationController := controllers.NewLocationController(models.DB)

	locationRoutes := router.Group("/locations")
	{
		locationRoutes.POST("", locationController.CreateLocation)
		locationRoutes.GET("", locationController.GetAllLocations) // Updated route name
		locationRoutes.GET("/:id", locationController.GetLocation)
		locationRoutes.PUT("/:id", locationController.UpdateLocation)
		locationRoutes.DELETE("/:id", locationController.DeleteLocation)
	}
}
