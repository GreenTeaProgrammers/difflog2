package controllers

import (
	"log/slog"
	"net/http"
	"strings"

	"github.com/GreenTeaProgrammers/difflog2/backend/auth"
	"github.com/GreenTeaProgrammers/difflog2/backend/models"
	"github.com/GreenTeaProgrammers/difflog2/backend/repository"
	"github.com/gin-gonic/gin"
)

type AuthController struct {
	UserRepo repository.UserRepository
}

func NewAuthController(userRepo repository.UserRepository) *AuthController {
	return &AuthController{UserRepo: userRepo}
}

// User registration handler
func (ac *AuthController) Register(c *gin.Context) {
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
	if _, err := ac.UserRepo.FindByEmail(input.Email); err == nil {
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

	if err := ac.UserRepo.Create(&user); err != nil {
		// MySQLの重複エラー(Error 1062)をチェック
		if strings.Contains(err.Error(), "Error 1062") {
			if strings.Contains(err.Error(), "username") {
				slog.Warn("Username already exists", "username", input.Username)
				c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
				return
			}
			// emailの重複は事前にチェックしているが、念のためここでも処理
			if strings.Contains(err.Error(), "email") {
				slog.Warn("Email already registered", "email", input.Email)
				c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
				return
			}
		}
		// その他のデータベースエラー
		slog.Error("Error creating user", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	slog.Info("User registered successfully", "email", input.Email)
	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
}

// User login handler
func (ac *AuthController) Login(c *gin.Context) {
	var input models.LoginInput

	// Log the incoming request for debugging
	if err := c.ShouldBindJSON(&input); err != nil {
		// 4xx系エラー: クライアントからの無効な入力
		slog.Warn("Error binding JSON", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	slog.Info("Login attempt", "identifier", input.Identifier)

	// Find user by email or username
	var user *models.User
	var err error
	if strings.Contains(input.Identifier, "@") {
		user, err = ac.UserRepo.FindByEmail(input.Identifier)
	} else {
		user, err = ac.UserRepo.FindByUsername(input.Identifier)
	}

	if err != nil {
		// 4xx系エラー: 無効なメールアドレスまたはユーザー名
		slog.Warn("Invalid identifier", "identifier", input.Identifier)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid identifier or password"})
		return
	}

	if !auth.ComparePassword(user.Password, input.Password) {
		// 4xx系エラー: 無効なパスワード
		slog.Warn("Invalid password", "identifier", input.Identifier)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid identifier or password"})
		return
	}

	token, err := auth.GenerateJWT(user.ID)
	if err != nil {
		// 5xx系サーバーエラー: JWTトークンの生成に失敗
		slog.Error("Error generating token", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	slog.Info("Login successful", "identifier", input.Identifier)
	c.JSON(http.StatusOK, gin.H{"token": token, "id": user.ID, "username": user.Username, "email": user.Email, "message": "Login successful"})
}

// User logout handler
func Logout(c *gin.Context) {
	// Log user logout action
	slog.Info("User logged out")
	c.JSON(http.StatusOK, gin.H{"message": "User logged out successfully"})
}
