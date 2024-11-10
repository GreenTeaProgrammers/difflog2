package models

import "time"

type DiffItem struct {
	ID            uint   `json:"id" gorm:"primaryKey"`
	DiffID        string `json:"diff_id" gorm:"not null;index"`
	Diff          *Diff  `gorm:"foreignKey:DiffID;constraint:OnDelete:CASCADE"`
	ItemName      string `json:"item_name"`
	ChangeType    string `json:"change_type"`
	PreviousCount int    `json:"previous_count"`
	CurrentCount  int    `json:"current_count"`
}

type Diff struct {
	ID         string      `json:"id" gorm:"primaryKey"`
	LocationID string      `json:"location_id"`
	Date       time.Time   `json:"date"`
	Changes    []*DiffItem `gorm:"foreignKey:DiffID;constraint:OnDelete:CASCADE"`
	CommitID   uint        `json:"commit_id"`
	Commit     *Commit     `gorm:"foreignKey:CommitID;constraint:OnDelete:CASCADE"`
}

type DiffResponse struct {
	Added    int        `json:"added"`    // 追加された項目数
	Deleted  int        `json:"deleted"`  // 削除された項目数
	Modified int        `json:"modified"` // 変更された項目数
	Changes  []DiffItem `json:"changes"`  // 種類ごとのオブジェクト変化情報
}
