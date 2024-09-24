package models

import (
	"time"

	"gorm.io/gorm"
)

type Commit struct {
	ID         uint           `gorm:"primaryKey"`
	LocationID string         `gorm:"type:varchar(100);not null"`
	Date       time.Time      `gorm:"autoCreateTime"`
	Diff       Diff           `gorm:"foreignKey:CommitID;constraint:OnDelete:CASCADE;"`
	CreatedAt  time.Time      `gorm:"autoCreateTime"`
	UpdatedAt  time.Time      `gorm:"autoUpdateTime"`
	DeletedAt  gorm.DeletedAt `gorm:"index"`
}
