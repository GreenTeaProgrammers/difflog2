package models

import (
	"time"

	"gorm.io/gorm"
)

// Location model
type Location struct {
	gorm.Model
	UserID         uint
	Name           string
	Description    string
	LastCommitDate time.Time
}

// Capture model
type Capture struct {
	gorm.Model
	LocationID uint
	ImageURL   string
	FilePath   string
	Date       time.Time
	Analyzed   bool
}

// Commit model
type Commit struct {
	gorm.Model
	LocationID uint
	Date       time.Time
	Diff       *Diff `gorm:"foreignKey:CommitID"`
}

// Diff model
type Diff struct {
	gorm.Model
	LocationID uint
	Date       time.Time
	CommitID   uint
	Changes    []DiffItem `gorm:"foreignKey:DiffID"`
}

// DiffItem model
type DiffItem struct {
	gorm.Model
	DiffID        uint
	ItemID        string
	ItemName      string
	ChangeType    string
	PreviousCount int
	CurrentCount  int
}

// CommitResponse is a struct for the response of GetCommitsByLocationAndDate
type CommitResponse struct {
	ID    uint   `json:"id"`
	label string `json:"label"`
	count int    `json:"count"`
}

// DiffResponse model for ML server response
type DiffResponse struct {
	Diff      Diff       `json:"diff"`
	DiffItems []DiffItem `json:"diff_items"`
}
