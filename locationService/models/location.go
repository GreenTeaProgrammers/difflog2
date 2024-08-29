package models

import (
	"time"

	"gorm.io/gorm"
)

type Location struct {
	ID             string         `json:"id" gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	Name           string         `json:"name" gorm:"not null"`
	Description    string         `json:"description,omitempty"`
	LastCommitDate time.Time      `json:"last_commit_date" gorm:"not null"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}
