package routes

import (
	"github.com/GreenTeaProgrammers/difflog2/backend/controllers"
	"github.com/gin-gonic/gin"
)

func CommitRoutes(router *gin.Engine, commitController *controllers.CommitController) {
	commitGroup := router.Group("/commits")
	{
		commitGroup.POST("/", commitController.CreateCommit)
		commitGroup.GET("/", commitController.GetCommits)
		commitGroup.GET("/:id", commitController.GetCommit)
		commitGroup.PUT("/:id", commitController.UpdateCommit)
		commitGroup.DELETE("/:id", commitController.DeleteCommit)
		commitGroup.GET("/count_by_date", commitController.GetCommitCountByDate)                     // 同日付のコミット数を返却
		commitGroup.GET("/countByLocationAndDate", commitController.GetCommitCountByLocationAndDate) // 追加: LocationIDと日付によるコミット数を返却
		commitGroup.GET("/commits-by-location-and-date", commitController.GetCommitsByLocationAndDate) // 追加: LocationIDと日付によるコミットを返却
	}
}
