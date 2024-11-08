// controllers/commit_response.go
package controllers

type CommitResponse struct {
    ID           uint   `json:"id"`
    label     string `json:"item_name"`
    count int    `json:"current_count"`
}