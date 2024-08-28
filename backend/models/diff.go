package models

import "time"

type DiffItem struct {
	ItemID        string `json:"item_id" bson:"item_id"`
	ItemName      string `json:"item_name" bson:"item_name"`
	ChangeType    string `json:"change_type" bson:"change_type"` // "added", "deleted", "modified"
	PreviousCount int    `json:"previous_count" bson:"previous_count"`
	CurrentCount  int    `json:"current_count" bson:"current_count"`
}

type Diff struct {
	ID         string     `json:"id" bson:"_id,omitempty"`
	LocationID string     `json:"location_id" bson:"location_id"`
	Date       time.Time  `json:"date" bson:"date"`
	Changes    []DiffItem `json:"changes" bson:"changes"`
}
