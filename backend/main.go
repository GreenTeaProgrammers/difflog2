package main

import (
	"log"
	"os"

	"github.com/GreenTeaProgrammers/difflog2/middleware"
	"github.com/GreenTeaProgrammers/difflog2/models"
	"github.com/GreenTeaProgrammers/difflog2/routes"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 環境変数をロード
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	r := gin.Default()

	// CORS ミドルウェアを適用
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.LoggingMiddleware())

	models.ConnectDatabase()

	// データベース接続を設定
	models.SetDatabase(models.DB)

	// ルートを設定
	routes.AuthRoutes(r)

	// ポートを指定してサーバーを起動
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	r.Run(":" + port)
}
