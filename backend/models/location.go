package models

import "time"

type Location struct {
	ID             int       `json:"id"`
	Name           string    `json:"name"`
	Description    string    `json:"description,omitempty"`
	LastCommitDate time.Time `json:"last_commit_date"`
}
