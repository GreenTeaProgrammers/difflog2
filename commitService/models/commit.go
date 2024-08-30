package models

import (
	"time"

	"gorm.io/gorm"
)

type DiffItem struct {
	ID            uint   `gorm:"primaryKey"`
	DiffID        uint   `gorm:"not null"`
	ItemID        string `gorm:"type:varchar(100);not null"`
	ItemName      string `gorm:"type:varchar(100);not null"`
	ChangeType    string `gorm:"type:varchar(50);not null"` // "added", "deleted", "modified"
	PreviousCount int    `gorm:"not null"`
	CurrentCount  int    `gorm:"not null"`
}

type Diff struct {
	ID       uint       `gorm:"primaryKey"`
	CommitID uint       `gorm:"not null"`
	Changes  []DiffItem `gorm:"foreignKey:DiffID;constraint:OnDelete:CASCADE;"`
}

type Commit struct {
	ID         uint           `gorm:"primaryKey"`
	LocationID string         `gorm:"type:varchar(100);not null"`
	Date       time.Time      `gorm:"autoCreateTime"`
	Diff       Diff           `gorm:"foreignKey:CommitID;constraint:OnDelete:CASCADE;"`
	CreatedAt  time.Time      `gorm:"autoCreateTime"`
	UpdatedAt  time.Time      `gorm:"autoUpdateTime"`
	DeletedAt  gorm.DeletedAt `gorm:"index"`
}
