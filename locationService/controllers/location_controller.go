package controllers

import (
	"log/slog"
	"net/http"
	"strconv"
	"time"

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

func (cc *LocationController) CreateLocation(c *gin.Context) {
	var location models.Location
	if err := c.ShouldBindJSON(&location); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// last_commit_date に作成時の日時を代入
	now := time.Now()
	location.LastCommitDate = &now

	if err := cc.DB.Create(&location).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, location)
}

func (ctrl *LocationController) GetLocation(c *gin.Context) {
	id := c.Param("id")
	var location models.Location

	// Convert id from string to uint
	locationID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		slog.Error("Failed to parse location ID", slog.String("id", id), slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid location ID"})
		return
	}

	if err := ctrl.DB.First(&location, uint(locationID)).Error; err != nil {
		slog.Error("Location not found", slog.Int("location_id", int(locationID)), slog.Any("error", err))
		c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		return
	}

	slog.Info("Location retrieved successfully", slog.Int("location_id", int(location.ID)))
	c.JSON(http.StatusOK, location)
}

func (ctrl *LocationController) UpdateLocation(c *gin.Context) {
	id := c.Param("id")

	// Convert id from string to uint
	locationID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		slog.Error("Failed to parse location ID", slog.String("id", id), slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid location ID"})
		return
	}

	var location models.Location
	if err := ctrl.DB.First(&location, uint(locationID)).Error; err != nil {
		slog.Error("Location not found", slog.Int("location_id", int(locationID)), slog.Any("error", err))
		c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		return
	}

	if err := c.ShouldBindJSON(&location); err != nil {
		slog.Error("Failed to bind JSON", slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	location.ID = uint(locationID) // Ensure the ID remains consistent
	if err := ctrl.DB.Save(&location).Error; err != nil {
		slog.Error("Failed to update location", slog.Int("location_id", int(location.ID)), slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	slog.Info("Location updated successfully", slog.Int("location_id", int(location.ID)))
	c.JSON(http.StatusOK, location)
}

func (ctrl *LocationController) DeleteLocation(c *gin.Context) {
	id := c.Param("id")

	// Convert id from string to uint
	locationID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		slog.Error("Failed to parse location ID", slog.String("id", id), slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid location ID"})
		return
	}

	if err := ctrl.DB.Delete(&models.Location{}, uint(locationID)).Error; err != nil {
		slog.Error("Failed to delete location", slog.Int("location_id", int(locationID)), slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	slog.Info("Location deleted successfully", slog.Int("location_id", int(locationID)))
	c.JSON(http.StatusOK, gin.H{"message": "Location deleted successfully"})
}

func (ctrl *LocationController) GetAllLocations(c *gin.Context) {
	var locations []models.Location
	if err := ctrl.DB.Find(&locations).Error; err != nil {
		slog.Error("Failed to retrieve locations", slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	slog.Info("Locations retrieved successfully")
	c.JSON(http.StatusOK, locations)
}
