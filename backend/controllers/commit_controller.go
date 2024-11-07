package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/GreenTeaProgrammers/difflog2/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CommitController struct {
	DB *gorm.DB
}

// CreateCommit は新しいコミットを作成します
func (cc *CommitController) CreateCommit(c *gin.Context) {
	var commit models.Commit
	if err := c.ShouldBindJSON(&commit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ネストされた構造体（Diff と DiffItem）の作成を有効にするために、Associations を使用
	if err := cc.DB.Omit("Diff.Changes.*").Create(&commit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// DiffItem の作成
	if commit.Diff != nil && len(commit.Diff.Changes) > 0 {
		for i := range commit.Diff.Changes {
			commit.Diff.Changes[i].DiffID = commit.Diff.ID
		}
		if err := cc.DB.Create(&commit.Diff.Changes).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusCreated, commit)
}

// GetCommits はすべてのコミットを取得します
func (cc *CommitController) GetCommits(c *gin.Context) {
	var commits []models.Commit
	if err := cc.DB.Preload("Diff.Changes").Find(&commits).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, commits)
}

// GetCommit は指定された ID のコミットを取得します
func (cc *CommitController) GetCommit(c *gin.Context) {
	var commit models.Commit
	id := c.Param("id")
	if err := cc.DB.Preload("Diff.Changes").First(&commit, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Commit not found"})
		return
	}
	c.JSON(http.StatusOK, commit)
}

// UpdateCommit は既存のコミットを更新します
func (cc *CommitController) UpdateCommit(c *gin.Context) {
	var commit models.Commit
	id := c.Param("id")

	// 既存のコミットを取得
	if err := cc.DB.Preload("Diff.Changes").First(&commit, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Commit not found"})
		return
	}

	// リクエストから新しいデータを取得
	var input models.Commit
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// コミットのフィールドを更新
	commit.LocationID = input.LocationID
	commit.Date = input.Date

	// Diff の更新
	if input.Diff != nil {
		if commit.Diff == nil {
			// 新しい Diff を作成
			input.Diff.CommitID = commit.ID
			if err := cc.DB.Create(&input.Diff).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			commit.Diff = input.Diff
		} else {
			// 既存の Diff を更新
			commit.Diff.LocationID = input.Diff.LocationID
			commit.Diff.Date = input.Diff.Date

			// DiffItem の更新
			if len(input.Diff.Changes) > 0 {
				// 既存の DiffItem を削除
				if err := cc.DB.Where("diff_id = ?", commit.Diff.ID).Delete(&models.DiffItem{}).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				// 新しい DiffItem を作成
				for _, item := range input.Diff.Changes {
					item.DiffID = commit.Diff.ID
					if err := cc.DB.Create(&item).Error; err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
						return
					}
				}
			}
			if err := cc.DB.Save(&commit.Diff).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
	}

	// コミットを保存
	if err := cc.DB.Save(&commit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, commit)
}

// DeleteCommit は既存のコミットを削除します
func (cc *CommitController) DeleteCommit(c *gin.Context) {
	id := c.Param("id")
	if err := cc.DB.Delete(&models.Commit{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Commit deleted"})
}

// GetCommitCountByDate は指定された日付のコミット数を取得します
func (cc *CommitController) GetCommitCountByDate(c *gin.Context) {
	var count int64
	date := c.Query("date")

	parsedDate, err := time.Parse("2006-01-02", date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD."})
		return
	}

	if err := cc.DB.Model(&models.Commit{}).Where("DATE(date) = ?", parsedDate.Format("2006-01-02")).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"date": date, "commit_count": count})
}

// GetCommitCountByLocationAndDate は指定された場所と日付のコミット数を取得します
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

	query := cc.DB.Model(&models.Commit{}).Where("DATE(date) = ?", parsedDate.Format("2006-01-02"))
	if locationID != "all" {
		query = query.Where("location_id = ?", locationID)
	}

	if err := query.Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"locationID": locationID, "date": date, "commit_count": count})
}
