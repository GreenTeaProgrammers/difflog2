package routes

import (
	"github.com/GreenTeaProgrammers/difflog2/controllers"
	"github.com/gin-gonic/gin"
)

func CaptureRoutes(router *gin.Engine) {
	captureController := controllers.CaptureController{}

	// ルートの定義
	captureRoutes := router.Group("/captures")
	{
		captureRoutes.POST("", captureController.CreateCapture)       // 新しい撮影データの作成
		captureRoutes.GET("/:id", captureController.GetCapture)       // 撮影データの取得
		captureRoutes.PUT("/:id", captureController.UpdateCapture)    // 撮影データの更新
		captureRoutes.DELETE("/:id", captureController.DeleteCapture) // 撮影データの削除
	}
}
