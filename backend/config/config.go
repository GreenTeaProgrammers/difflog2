package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port string
}

// LoadConfig は設定を読み込みます。
func LoadConfig() *Config {
	// 環境変数をロード
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	config := &Config{
		Port: getEnv("PORT", "8081"),
	}

	return config
}

// getEnv は指定された環境変数を読み込み、存在しない場合はデフォルト値を返します。
func getEnv(key string, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

