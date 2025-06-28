package routes

import (
	"github.com/GreenTeaProgrammers/difflog2/backend/controllers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AuthRoutes(r *gin.Engine, db *gorm.DB) {
	authController := controllers.NewAuthController(db)

	r.POST("/register", authController.Register)
	r.POST("/login", authController.Login)
	r.POST("/logout", controllers.Logout) // LogoutはDBアクセスがないのでそのまま
}
