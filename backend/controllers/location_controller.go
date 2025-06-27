package controllers

import (
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/GreenTeaProgrammers/difflog2/backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LocationController struct {
	DB *gorm.DB
}

func NewLocationController(db *gorm.DB) *LocationController {
	return &LocationController{DB: db}
}

// 共通のエラーレスポンス関数
func respondWithError(c *gin.Context, code int, message string, err error) {
	slog.Error(message, slog.Any("error", err))
	c.JSON(code, gin.H{"error": message})
}

// 共通のIDパース関数
func parseUintParam(c *gin.Context, param string) (uint, error) {
	idStr := c.Param(param)
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid "+param+" ID", err)
		return 0, err
	}
	return uint(id), nil
}

func (ctrl *LocationController) CreateLocation(c *gin.Context) {
	var location models.Location
	if err := c.ShouldBindJSON(&location); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid input", err)
		return
	}

	// last_commit_date に作成時の日時を代入
	location.LastCommitDate = time.Now()

	if err := ctrl.DB.Create(&location).Error; err != nil {
		respondWithError(c, http.StatusInternalServerError, "Failed to create location", err)
		return
	}
	c.JSON(http.StatusOK, location)
}

func (ctrl *LocationController) GetLocation(c *gin.Context) {
	locationID, err := parseUintParam(c, "id")
	if err != nil {
		return
	}

	var location models.Location
	if err := ctrl.DB.First(&location, locationID).Error; err != nil {
		respondWithError(c, http.StatusNotFound, "Location not found", err)
		return
	}

	slog.Info("Location retrieved successfully", slog.Int("location_id", int(locationID)))
	c.JSON(http.StatusOK, location)
}

func (ctrl *LocationController) UpdateLocation(c *gin.Context) {
	locationID, err := parseUintParam(c, "id")
	if err != nil {
		return
	}

	var location models.Location
	if err := ctrl.DB.First(&location, locationID).Error; err != nil {
		respondWithError(c, http.StatusNotFound, "Location not found", err)
		return
	}

	if err := c.ShouldBindJSON(&location); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid input", err)
		return
	}

	location.ID = locationID
	if err := ctrl.DB.Save(&location).Error; err != nil {
		respondWithError(c, http.StatusInternalServerError, "Failed to update location", err)
		return
	}

	slog.Info("Location updated successfully", slog.Int("location_id", int(locationID)))
	c.JSON(http.StatusOK, location)
}

func (ctrl *LocationController) DeleteLocation(c *gin.Context) {
	locationID, err := parseUintParam(c, "id")
	if err != nil {
		return
	}

	if err := ctrl.DB.Delete(&models.Location{}, locationID).Error; err != nil {
		respondWithError(c, http.StatusInternalServerError, "Failed to delete location", err)
		return
	}

	slog.Info("Location deleted successfully", slog.Int("location_id", int(locationID)))
	c.JSON(http.StatusOK, gin.H{"message": "Location deleted successfully"})
}

func (ctrl *LocationController) GetAllLocations(c *gin.Context) {
	var locations []models.Location
	if err := ctrl.DB.Find(&locations).Error; err != nil {
		respondWithError(c, http.StatusInternalServerError, "Failed to retrieve locations", err)
		return
	}

	slog.Info("Locations retrieved successfully")
	c.JSON(http.StatusOK, locations)
}
