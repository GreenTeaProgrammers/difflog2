package models

import (
	"fmt"
	"log/slog"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func SetDatabase(database *gorm.DB) {
	DB = database
}

// ConnectDatabase initializes the database connection
func ConnectDatabase() {
	var err error
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	slog.Info("Connecting to database", "dsn", dsn) // デバッグ用のログ出力

	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		// 5xx系のサーバーエラー: データベース接続に失敗した場合
		slog.Error("Could not connect to the database", "error", err)
		os.Exit(1)
	}

	// Create tables
	if err := DB.AutoMigrate(&Commit{}, &Diff{}, &DiffItem{}); err != nil {
		// 5xx系のサーバーエラー: データベースマイグレーションに失敗した場合
		slog.Error("Could not migrate database", "error", err)
		os.Exit(1)
	}
}

// ResetDatabase resets the database by dropping and recreating it
func ResetDatabase() {
	if err := DB.Exec("DROP DATABASE IF EXISTS test_video_sns").Error; err != nil {
		// 5xx系のサーバーエラー: データベース削除に失敗した場合
		slog.Error("Failed to drop database", "error", err)
		return
	}
	if err := DB.Exec("CREATE DATABASE test_video_sns").Error; err != nil {
		// 5xx系のサーバーエラー: データベース作成に失敗した場合
		slog.Error("Failed to create database", "error", err)
		return
	}
	ConnectDatabase()
}
