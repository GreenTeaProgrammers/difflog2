package controllers

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/GreenTeaProgrammers/difflog2/backend/auth"
	"github.com/GreenTeaProgrammers/difflog2/backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// User registration handler
func Register(c *gin.Context) {
	var input models.RegisterInput

	// Log the incoming request for debugging
	if err := c.ShouldBindJSON(&input); err != nil {
		// 4xx系エラー: クライアントからの無効な入力
		slog.Warn("Error binding JSON", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	slog.Info("Registering user", "input", input)

	// Check if the user already exists
	if _, err := models.GetUserByEmail(input.Email); err == nil {
		// 4xx系エラー: 既に登録されているメールアドレス
		slog.Warn("Email already registered", "email", input.Email)
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	hashedPassword, err := auth.HashPassword(input.Password)
	if err != nil {
		// 5xx系サーバーエラー: パスワードのハッシュ化に失敗
		slog.Error("Error hashing password", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: hashedPassword,
	}

	if err := models.CreateUser(&user); err != nil {
		// 4xx系エラー: ユーザー名が既に存在する場合
		if errors.Is(err, gorm.ErrRecordNotFound) {
			slog.Warn("Username already exists", "username", input.Username)
			c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
			return
		}
		// 5xx系サーバーエラー: ユーザー作成に失敗
		slog.Error("Error creating user", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	slog.Info("User registered successfully", "email", input.Email)
	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
}

// User login handler
func Login(c *gin.Context) {
	var input models.LoginInput

	// Log the incoming request for debugging
	if err := c.ShouldBindJSON(&input); err != nil {
		// 4xx系エラー: クライアントからの無効な入力
		slog.Warn("Error binding JSON", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	slog.Info("Login attempt", "email", input.Email)

	user, err := models.GetUserByEmail(input.Email)
	if err != nil {
		// 4xx系エラー: 無効なメールアドレス
		slog.Warn("Invalid email", "email", input.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if !auth.ComparePassword(input.Password, user.Password) {
		// 4xx系エラー: 無効なパスワード
		slog.Warn("Invalid password", "email", input.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token, err := auth.GenerateJWT(user.ID)
	if err != nil {
		// 5xx系サーバーエラー: JWTトークンの生成に失敗
		slog.Error("Error generating token", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	slog.Info("Login successful", "email", input.Email)
	c.JSON(http.StatusOK, gin.H{"token": token, "id": user.ID, "username": user.Username, "email": user.Email, "message": "Login successful"})
}

// User logout handler
func Logout(c *gin.Context) {
	// Log user logout action
	slog.Info("User logged out")
	c.JSON(http.StatusOK, gin.H{"message": "User logged out successfully"})
}
