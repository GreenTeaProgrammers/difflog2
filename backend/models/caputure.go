package models

import (
	"time"
)

type Capture struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"` // 自動インクリメントの主キー
	LocationID uint      `gorm:"index" json:"location_id"`           // 外部キーとして使用する可能性がある場合にインデックス付け
	ImageURL   string    `json:"image_url"`                          // 画像のURL
	Date       time.Time `json:"date"`                               // 撮影日時
	Analyzed   bool      `json:"analyzed"`                           // 分析済みかどうかのフラグ
}
