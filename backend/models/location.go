package models

import "time"

type Location struct {
	ID             string    `json:"id" bson:"_id,omitempty"`
	Name           string    `json:"name" bson:"name"`
	Description    string    `json:"description,omitempty" bson:"description"`
	LastCommitDate time.Time `json:"last_commit_date" bson:"last_commit_date"`
}
