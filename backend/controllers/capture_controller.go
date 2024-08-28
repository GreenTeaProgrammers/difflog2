package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"log/slog"

	"github.com/GreenTeaProgrammers/difflog2/models"
	"github.com/gin-gonic/gin"
)

type CaptureController struct{}

// CaptureRequest は撮影データのリクエスト構造体
type CaptureRequest struct {
	ImageURL   string `json:"image_url"`   // 画像のURL
	LocationID uint   `json:"location_id"` // 撮影場所のID
}

// DiffResponse はMLサーバーからのレスポンス構造体
type DiffResponse struct {
	Added    int `json:"added"`
	Deleted  int `json:"deleted"`
	Modified int `json:"modified"`
}

// CreateCapture は新しい撮影データを作成し、MLサーバーに委託してDiffを取得します
func (ctrl CaptureController) CreateCapture(c *gin.Context) {
	var captureRequest CaptureRequest
	if err := c.ShouldBindJSON(&captureRequest); err != nil {
		slog.Error("Failed to bind capture request JSON", slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// 撮影データを保存する
	capture := models.Capture{
		ImageURL:   captureRequest.ImageURL,
		LocationID: captureRequest.LocationID,
		Date:       time.Now(), // 現在の日時を設定
		Analyzed:   false,      // 初期状態は未解析
	}
	if err := models.DB.Create(&capture).Error; err != nil {
		slog.Error("Failed to save capture", slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save capture"})
		return
	}

	// MLサーバーに画像データをPOSTしてDiffを計算
	diffResponse, err := callMLServer(capture.ImageURL)
	if err != nil {
		slog.Error("Failed to get diff from ML server", slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get diff from ML server"})
		return
	}

	// フロントエンドにDiff結果を返却
	slog.Info("Diff calculated successfully", slog.Any("diff", diffResponse))
	c.JSON(http.StatusOK, diffResponse)
}

// GetCapture は指定されたIDの撮影データを取得します
func (ctrl CaptureController) GetCapture(c *gin.Context) {
	id := c.Param("id")
	intID, err := strconv.Atoi(id)
	if err != nil {
		slog.Error("Invalid capture ID", slog.String("id", id), slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid capture ID"})
		return
	}

	var capture models.Capture
	if err := models.DB.First(&capture, intID).Error; err != nil {
		slog.Error("Capture not found", slog.String("id", id), slog.Any("error", err))
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
		slog.Error("Invalid capture ID", slog.String("id", id), slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid capture ID"})
		return
	}

	var capture models.Capture
	if err := c.ShouldBindJSON(&capture); err != nil {
		slog.Error("Failed to bind capture JSON", slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if err := models.DB.Model(&capture).Where("id = ?", intID).Updates(capture).Error; err != nil {
		slog.Error("Failed to update capture", slog.String("id", id), slog.Any("error", err))
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
		slog.Error("Invalid capture ID", slog.String("id", id), slog.Any("error", err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid capture ID"})
		return
	}

	if err := models.DB.Delete(&models.Capture{}, intID).Error; err != nil {
		slog.Error("Failed to delete capture", slog.String("id", id), slog.Any("error", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete capture"})
		return
	}

	slog.Info("Capture deleted successfully", slog.String("id", id))
	c.JSON(http.StatusOK, gin.H{"message": "Capture deleted"})
}

// callMLServer はMLサーバーに画像データを送信し、差分を取得します
func callMLServer(imageURL string) (*DiffResponse, error) {
	mlServerURL := "http://ml-server-url/diff" // MLサーバーのエンドポイントURL
	payload := map[string]string{"image_url": imageURL}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	resp, err := http.Post(mlServerURL, "application/json", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ML server returned status: %d", resp.StatusCode)
	}

	var diffResponse DiffResponse
	if err := json.NewDecoder(resp.Body).Decode(&diffResponse); err != nil {
		return nil, err
	}

	return &diffResponse, nil
}
