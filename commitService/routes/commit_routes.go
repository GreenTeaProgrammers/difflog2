package routes

import (
	"github.com/GreenTeaProgrammers/difflog2/commitService/controllers"

	"github.com/GreenTeaProgrammers/difflog2/commitService/models"
	"github.com/gin-gonic/gin"
)

func CommitRoutes(router *gin.Engine) {
	commitController := controllers.CommitController{DB: models.DB}

	commitGroup := router.Group("/commits")
	{
		commitGroup.POST("/", commitController.CreateCommit)
		commitGroup.GET("/", commitController.GetCommits)
		commitGroup.GET("/:id", commitController.GetCommit)
		commitGroup.PUT("/:id", commitController.UpdateCommit)
		commitGroup.DELETE("/:id", commitController.DeleteCommit)
		commitGroup.GET("/count_by_date", commitController.GetCommitCountByDate)                     // 同日付のコミット数を返却
		commitGroup.GET("/countByLocationAndDate", commitController.GetCommitCountByLocationAndDate) // 追加: LocationIDと日付によるコミット数を返却
	}
}
