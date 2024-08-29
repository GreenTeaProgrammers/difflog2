package middleware

import (
	"time"

	"log/slog"

	"github.com/gin-gonic/gin"
)

// LoggingMiddleware ログ記録用のミドルウェア
func LoggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// リクエストが処理される前の時間を記録
		startTime := time.Now()

		// 次のミドルウェアまたはハンドラを呼び出し
		c.Next()

		// 処理後の時間を記録
		endTime := time.Now()
		latency := endTime.Sub(startTime)

		// リクエストとレスポンスの情報を構造化してログに記録
		slog.Info("Request completed",
			slog.String("method", c.Request.Method),
			slog.String("path", c.Request.URL.Path),
			slog.Int("status", c.Writer.Status()),
			slog.Duration("latency", latency),
			slog.String("client_ip", c.ClientIP()),
		)
	}
}
