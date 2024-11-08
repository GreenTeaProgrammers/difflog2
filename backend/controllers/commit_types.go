// controllers/commit_response.go
package controllers

type CommitResponse struct {
    ItemName     string `json:"item_name"`
    CurrentCount int    `json:"current_count"`
}