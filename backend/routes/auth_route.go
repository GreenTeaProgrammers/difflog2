package routes

import (
	"github.com/GreenTeaProgrammers/difflog2/backend/controllers"
	"github.com/GreenTeaProgrammers/difflog2/backend/repository"
	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine, userRepo repository.UserRepository) {
	authController := controllers.NewAuthController(userRepo)

	r.POST("/register", authController.Register)
	r.POST("/login", authController.Login)
	r.POST("/logout", controllers.Logout) // LogoutはDBアクセスがないのでそのまま
}
