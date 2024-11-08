// controllers/commit_response.go
package controllers

type CommitResponse struct {
    ID           uint   `json:"id"`
    ItemName     string `json:"item_name"`
    CurrentCount int    `json:"current_count"`
}