package controllers

type DiffItemResponse struct {
    ItemName      string `json:"item_name"`
    ChangeType    string `json:"change_type"`
    PreviousCount int    `json:"previous_count"`
    CurrentCount  int    `json:"current_count"`
}

type Item struct {
	Label string `json:"label"`
	Count int    `json:"count"`
}

type MLResponse []Item