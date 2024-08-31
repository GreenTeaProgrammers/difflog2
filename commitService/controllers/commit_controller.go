package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/GreenTeaProgrammers/difflog2/commitService/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CommitController struct {
	DB *gorm.DB
}

// CreateCommit creates a new commit record
func (cc *CommitController) CreateCommit(c *gin.Context) {
	var commit models.Commit
	if err := c.ShouldBindJSON(&commit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := cc.DB.Create(&commit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, commit)
}

// GetCommits retrieves all commit records
func (cc *CommitController) GetCommits(c *gin.Context) {
	var commits []models.Commit
	if err := cc.DB.Preload("Diff.Changes").Find(&commits).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, commits)
}

// GetCommit retrieves a single commit record by ID
func (cc *CommitController) GetCommit(c *gin.Context) {
	var commit models.Commit
	id := c.Param("id")
	if err := cc.DB.Preload("Diff.Changes").First(&commit, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Commit not found"})
		return
	}
	c.JSON(http.StatusOK, commit)
}

// UpdateCommit updates an existing commit record
func (cc *CommitController) UpdateCommit(c *gin.Context) {
	var commit models.Commit
	id := c.Param("id")
	if err := cc.DB.First(&commit, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Commit not found"})
		return
	}

	if err := c.ShouldBindJSON(&commit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := cc.DB.Save(&commit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, commit)
}

// DeleteCommit deletes an existing commit record
func (cc *CommitController) DeleteCommit(c *gin.Context) {
	id := c.Param("id")
	if err := cc.DB.Delete(&models.Commit{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Commit deleted"})
}

// GetCommitCountByDate retrieves the number of commits on the same date
func (cc *CommitController) GetCommitCountByDate(c *gin.Context) {
	var count int64
	date := c.Query("date")

	parsedDate, err := time.Parse("2006-01-02", date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD."})
		return
	}

	if err := cc.DB.Model(&models.Commit{}).Where("DATE(date) = ?", parsedDate).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"date": date, "commit_count": count})
}

func (cc *CommitController) GetCommitCountByLocationAndDate(c *gin.Context) {
	var count int64
	locationID := c.Query("locationID")
	date := c.Query("date")

	// 日付パラメータをログ出力
	fmt.Printf("Received date: %s\n", date)

	parsedDate, err := time.Parse("2006-01-02", date)
	if err != nil {
		fmt.Println("Date parsing failed:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD."})
		return
	}

	query := cc.DB.Model(&models.Commit{}).Where("DATE(date) = ?", parsedDate)
	if locationID != "all" {
		query = query.Where("location_id = ?", locationID)
	}

	if err := query.Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"locationID": locationID, "date": date, "commit_count": count})
}
