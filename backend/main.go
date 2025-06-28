package main

import (
	"log/slog"
	"os"

	"github.com/GreenTeaProgrammers/difflog2/backend/config"
	"github.com/GreenTeaProgrammers/difflog2/backend/controllers"
	"github.com/GreenTeaProgrammers/difflog2/backend/middleware"
	"github.com/GreenTeaProgrammers/difflog2/backend/models"
	"github.com/GreenTeaProgrammers/difflog2/backend/routes"
	"github.com/gin-gonic/gin"
)

func main() {
	// 設定を読み込む
	cfg := config.LoadConfig()

	// ログを初期化
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{}))
	slog.SetDefault(logger)

	r := gin.Default()

	// CORS ミドルウェアを適用
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.LoggingMiddleware())

	// データベース接続を設定
	models.ConnectDatabase()
	models.SetDatabase(models.DB)
	// Seeding(models.DB)

	// コントローラーを初期化
	detectionController, err := controllers.NewDetectionController()
	if err != nil {
		slog.Error("failed to create detection controller", slog.Any("error", err))
		// エラーが発生した場合は、後の処理を続行せずに終了するか、
		// エラーハンドリング戦略に応じて適切に対応する必要があります。
		// ここでは、ログを出力して終了します。
		os.Exit(1)
	}

	// ルートを設定
	routes.AuthRoutes(r)
	routes.CaptureRoutes(r)
	routes.CommitRoutes(r)
	routes.RegisterLocationRoutes(r)
	routes.RegisterDetectionRoutes(r, detectionController)

	// ポートを指定してサーバーを起動
	slog.Info("Starting server...", slog.String("port", cfg.Port))
	if err := r.Run(":" + cfg.Port); err != nil {
		slog.Error("Failed to start server", slog.String("port", cfg.Port), slog.Any("error", err))
	}
}
