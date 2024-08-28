package models

import "time"

type Capture struct {
	ID         string    `json:"id" bson:"_id,omitempty"`
	LocationID string    `json:"location_id" bson:"location_id"`
	ImageURL   string    `json:"image_url" bson:"image_url"`
	Date       time.Time `json:"date" bson:"date"`
	Analyzed   bool      `json:"analyzed" bson:"analyzed"`
}
