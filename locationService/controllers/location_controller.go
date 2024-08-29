package controllers

import (
	"log/slog"
	"net/http"

	"github.com/GreenTeaProgrammers/difflog2/locationService/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LocationController struct {
	DB *gorm.DB
}

func NewLocationController(db *gorm.DB) *LocationController {
	return &LocationController{DB: db}
}

func (ctrl *LocationController) CreateLocation(c *gin.Context) {
	var location models.Location
	if err := c.ShouldBindJSON(&location); err != nil {
		slog.Error("Failed to bind JSON", slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.DB.Create(&location).Error; err != nil {
		slog.Error("Failed to create location", slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	slog.Info("Location created successfully", slog.String("location_id", location.ID))
	c.JSON(http.StatusOK, location)
}

func (ctrl *LocationController) GetLocation(c *gin.Context) {
	id := c.Param("id")
	var location models.Location

	if err := ctrl.DB.First(&location, "id = ?", id).Error; err != nil {
		slog.Error("Location not found", slog.String("location_id", id), slog.Any("error", err))
		c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		return
	}

	slog.Info("Location retrieved successfully", slog.String("location_id", id))
	c.JSON(http.StatusOK, location)
}

func (ctrl *LocationController) UpdateLocation(c *gin.Context) {
	id := c.Param("id")
	var location models.Location

	if err := ctrl.DB.First(&location, "id = ?", id).Error; err != nil {
		slog.Error("Location not found", slog.String("location_id", id), slog.Any("error", err))
		c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		return
	}

	if err := c.ShouldBindJSON(&location); err != nil {
		slog.Error("Failed to bind JSON", slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.DB.Save(&location).Error; err != nil {
		slog.Error("Failed to update location", slog.String("location_id", id), slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	slog.Info("Location updated successfully", slog.String("location_id", location.ID))
	c.JSON(http.StatusOK, location)
}

func (ctrl *LocationController) DeleteLocation(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.DB.Delete(&models.Location{}, "id = ?", id).Error; err != nil {
		slog.Error("Failed to delete location", slog.String("location_id", id), slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	slog.Info("Location deleted successfully", slog.String("location_id", id))
	c.JSON(http.StatusOK, gin.H{"message": "Location deleted successfully"})
}
