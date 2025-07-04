package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"log/slog"

	"github.com/GreenTeaProgrammers/difflog2/backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CaptureController struct {
	DB *gorm.DB
}

// CaptureRequest は撮影データのリクエスト構造体
type CaptureRequest struct {
	LocationID uint `json:"location_id"` // 撮影場所のID
}

// CreateCapture は新しい撮影データを作成し、画像をサーバーに保存します
func (ctrl CaptureController) CreateCapture(c *gin.Context) {
	var captureRequest CaptureRequest
	if err := c.ShouldBind(&captureRequest); err != nil {
		slog.Error("Failed to bind capture request: Invalid input", slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// ファイルを受け取る
	file, err := c.FormFile("image")
	if err != nil {
		slog.Error("Failed to receive file: FormFile error", slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to receive file"})
		return
	}

	// 画像を保存するディレクトリを指定
	saveDir := "uploads"
	if _, err := os.Stat(saveDir); os.IsNotExist(err) {
		if err := os.Mkdir(saveDir, os.ModePerm); err != nil {
			slog.Error("Failed to create upload directory", slog.Any("error", err), slog.String("directory", saveDir))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
			return
		}
	}

	// ファイル名とパスを決定
	filename := fmt.Sprintf("%d-%s", time.Now().Unix(), file.Filename)
	filepath := filepath.Join(saveDir, filename)

	// ファイルを保存
	if err := c.SaveUploadedFile(file, filepath); err != nil {
		slog.Error("Failed to save file", slog.Any("error", err), slog.String("filepath", filepath))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// 撮影データを保存する
	capture := models.Capture{
		LocationID: captureRequest.LocationID,
		ImageURL:   "/" + filepath, // 相対パスとして保存
		FilePath:   filepath,       // 実際のファイルパスを保存
		Date:       time.Now(),     // 現在の日時を設定
		Analyzed:   false,          // 初期状態は未解析
	}
	if err := ctrl.DB.Create(&capture).Error; err != nil {
		slog.Error("Failed to save capture to database", slog.Any("error", err), slog.Any("capture", capture))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save capture"})
		return
	}

	// 画像のURLを使用してMLサーバーに送信
	// mlResponse, err := callMLServer(capture.ImageURL)
	// if err != nil {
	// 	slog.Error("Failed to get diff from ML server", slog.Any("error", err), slog.String("imageURL", capture.ImageURL))
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get diff from ML server"})
	// 	return
	// }

	// MLサーバーからのレスポンスをログに記録
	// slog.Info("Diff calculated successfully", slog.Any("diff", mlResponse))

	// フロントエンドにCaptureデータとMLサーバーからの結果を返却
	response := gin.H{
		"capture": capture,
		// "mlResponse": mlResponse, // ML連携は一時的に無効化
	}
	c.JSON(http.StatusOK, response)
}

// GetCapture は指定されたIDの撮影データを取得します
func (ctrl CaptureController) GetCapture(c *gin.Context) {
	id := c.Param("id")
	intID, err := strconv.Atoi(id)
	if err != nil {
		slog.Error("Invalid capture ID: Failed to convert to integer", slog.String("id", id), slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid capture ID"})
		return
	}

	var capture models.Capture
	if err := ctrl.DB.First(&capture, intID).Error; err != nil {
		slog.Error("Capture not found in database", slog.String("id", id), slog.Any("error", err))
		c.JSON(http.StatusNotFound, gin.H{"error": "Capture not found"})
		return
	}

	slog.Info("Capture retrieved successfully", slog.Any("capture", capture))
	c.JSON(http.StatusOK, capture)
}

// UpdateCapture は指定されたIDの撮影データを更新します
func (ctrl CaptureController) UpdateCapture(c *gin.Context) {
	id := c.Param("id")
	intID, err := strconv.Atoi(id)
	if err != nil {
		slog.Error("Invalid capture ID: Failed to convert to integer", slog.String("id", id), slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid capture ID"})
		return
	}

	var capture models.Capture
	if err := c.ShouldBindJSON(&capture); err != nil {
		slog.Error("Failed to bind capture JSON: Invalid input", slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if err := ctrl.DB.Model(&capture).Where("id = ?", intID).Updates(capture).Error; err != nil {
		slog.Error("Failed to update capture in database", slog.String("id", id), slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update capture"})
		return
	}

	slog.Info("Capture updated successfully", slog.Any("capture", capture))
	c.JSON(http.StatusOK, capture)
}

// DeleteCapture は指定されたIDの撮影データを削除します
func (ctrl CaptureController) DeleteCapture(c *gin.Context) {
	id := c.Param("id")
	intID, err := strconv.Atoi(id)
	if err != nil {
		slog.Error("Invalid capture ID: Failed to convert to integer", slog.String("id", id), slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid capture ID"})
		return
	}

	if err := ctrl.DB.Delete(&models.Capture{}, intID).Error; err != nil {
		slog.Error("Failed to delete capture from database", slog.String("id", id), slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete capture"})
		return
	}

	slog.Info("Capture deleted successfully", slog.String("id", id))
	c.JSON(http.StatusOK, gin.H{"message": "Capture deleted"})
}

// callMLServer はMLサーバーに画像データを送信し、差分を取得します
// 現在はML連携を無効化しているため、この関数は使用されない
func callMLServer(imageURL string) (*models.DiffResponse, error) {
	// ダミーのレスポンスを返す
	slog.Warn("callMLServer is currently disabled. Returning dummy response.")
	return &models.DiffResponse{}, nil
}
