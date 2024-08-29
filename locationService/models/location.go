package models

import (
	"time"

	"gorm.io/gorm"
)

type Location struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	Name           string         `json:"name" gorm:"unique;not null"`
	LastCommitDate time.Time      `json:"last_commit_date" gorm:"not null"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}
