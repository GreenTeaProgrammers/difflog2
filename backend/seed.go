package main

import (
    "log/slog"
    "time"

    "github.com/GreenTeaProgrammers/difflog2/backend/models"
    "gorm.io/gorm"
)

func Seeding(db *gorm.DB) {
    specificTime := time.Date(2024, time.November, 9, 12, 24, 0, 0, time.UTC)

    // シードデータの作成
    users := []models.User{
        {Username: "user1", Email: "user1@example.com", Password: "password1"},
        {Username: "user2", Email: "user2@example.com", Password: "password2"},
        {Username: "user3", Email: "user3@example.com", Password: "password3"},
        {Username: "user4", Email: "user4@example.com", Password: "password4"},
        {Username: "user5", Email: "user5@example.com", Password: "password5"},
        {Username: "user6", Email: "user6@example.com", Password: "password6"},
        {Username: "user7", Email: "user7@example.com", Password: "password7"},
        {Username: "user8", Email: "user8@example.com", Password: "password8"},
        {Username: "user9", Email: "user9@example.com", Password: "password9"},
        {Username: "user10", Email: "user10@example.com", Password: "password10"},
    }

    locations := []models.Location{
        {Name: "Location1", Description: "Description1", LastCommitDate: specificTime},
        {Name: "Location2", Description: "Description2", LastCommitDate: specificTime},
        {Name: "Location3", Description: "Description3", LastCommitDate: specificTime},
        {Name: "Location4", Description: "Description4", LastCommitDate: specificTime},
        {Name: "Location5", Description: "Description5", LastCommitDate: specificTime},
        {Name: "Location6", Description: "Description6", LastCommitDate: specificTime},
        {Name: "Location7", Description: "Description7", LastCommitDate: specificTime},
        {Name: "Location8", Description: "Description8", LastCommitDate: specificTime},
        {Name: "Location9", Description: "Description9", LastCommitDate: specificTime},
        {Name: "Location10", Description: "Description10", LastCommitDate: specificTime},
    }

    captures := []models.Capture{
        {LocationID: 1, ImageURL: "http://example.com/image1.jpg", FilePath: "/path/to/image1.jpg", Date: specificTime, Analyzed: false},
        {LocationID: 2, ImageURL: "http://example.com/image2.jpg", FilePath: "/path/to/image2.jpg", Date: specificTime, Analyzed: true},
        {LocationID: 3, ImageURL: "http://example.com/image3.jpg", FilePath: "/path/to/image3.jpg", Date: specificTime, Analyzed: false},
        {LocationID: 4, ImageURL: "http://example.com/image4.jpg", FilePath: "/path/to/image4.jpg", Date: specificTime, Analyzed: true},
        {LocationID: 5, ImageURL: "http://example.com/image5.jpg", FilePath: "/path/to/image5.jpg", Date: specificTime, Analyzed: false},
        {LocationID: 6, ImageURL: "http://example.com/image6.jpg", FilePath: "/path/to/image6.jpg", Date: specificTime, Analyzed: true},
        {LocationID: 7, ImageURL: "http://example.com/image7.jpg", FilePath: "/path/to/image7.jpg", Date: specificTime, Analyzed: false},
        {LocationID: 8, ImageURL: "http://example.com/image8.jpg", FilePath: "/path/to/image8.jpg", Date: specificTime, Analyzed: true},
        {LocationID: 9, ImageURL: "http://example.com/image9.jpg", FilePath: "/path/to/image9.jpg", Date: specificTime, Analyzed: false},
        {LocationID: 10, ImageURL: "http://example.com/image10.jpg", FilePath: "/path/to/image10.jpg", Date: specificTime, Analyzed: true},
    }

    commits := []models.Commit{
        {LocationID: "1", Date: specificTime},
        {LocationID: "2", Date: specificTime},
        {LocationID: "3", Date: specificTime},
        {LocationID: "4", Date: specificTime},
        {LocationID: "5", Date: specificTime},
        {LocationID: "6", Date: specificTime},
        {LocationID: "7", Date: specificTime},
        {LocationID: "8", Date: specificTime},
        {LocationID: "9", Date: specificTime},
        {LocationID: "10", Date: specificTime},
    }

    diffs := []models.Diff{
        {ID: "1", LocationID: "1", Date: specificTime, CommitID: 1},
        {ID: "2", LocationID: "2", Date: specificTime, CommitID: 2},
        {ID: "3", LocationID: "3", Date: specificTime, CommitID: 3},
        {ID: "4", LocationID: "4", Date: specificTime, CommitID: 4},
        {ID: "5", LocationID: "5", Date: specificTime, CommitID: 5},
        {ID: "6", LocationID: "6", Date: specificTime, CommitID: 6},
        {ID: "7", LocationID: "7", Date: specificTime, CommitID: 7},
        {ID: "8", LocationID: "8", Date: specificTime, CommitID: 8},
        {ID: "9", LocationID: "9", Date: specificTime, CommitID: 9},
        {ID: "10", LocationID: "10", Date: specificTime, CommitID: 10},
    }

    diffItems := []models.DiffItem{
        {DiffID: "1", ItemID: "item1", ItemName: "Item 1", ChangeType: "added", PreviousCount: 0, CurrentCount: 1},
        {DiffID: "2", ItemID: "item2", ItemName: "Item 2", ChangeType: "modified", PreviousCount: 1, CurrentCount: 2},
        {DiffID: "3", ItemID: "item3", ItemName: "Item 3", ChangeType: "deleted", PreviousCount: 2, CurrentCount: 0},
        {DiffID: "4", ItemID: "item4", ItemName: "Item 4", ChangeType: "added", PreviousCount: 0, CurrentCount: 1},
        {DiffID: "5", ItemID: "item5", ItemName: "Item 5", ChangeType: "modified", PreviousCount: 1, CurrentCount: 2},
        {DiffID: "6", ItemID: "item6", ItemName: "Item 6", ChangeType: "deleted", PreviousCount: 2, CurrentCount: 0},
        {DiffID: "7", ItemID: "item7", ItemName: "Item 7", ChangeType: "added", PreviousCount: 0, CurrentCount: 1},
        {DiffID: "8", ItemID: "item8", ItemName: "Item 8", ChangeType: "modified", PreviousCount: 1, CurrentCount: 2},
        {DiffID: "9", ItemID: "item9", ItemName: "Item 9", ChangeType: "deleted", PreviousCount: 2, CurrentCount: 0},
        {DiffID: "10", ItemID: "item10", ItemName: "Item 10", ChangeType: "added", PreviousCount: 0, CurrentCount: 1},
    }

    // データベースにシードデータを挿入
    if err := db.Create(&users).Error; err != nil {
        slog.Error("Could not seed users", slog.Any("error", err))
    }
    if err := db.Create(&locations).Error; err != nil {
        slog.Error("Could not seed locations", slog.Any("error", err))
    }
    if err := db.Create(&captures).Error; err != nil {
        slog.Error("Could not seed captures", slog.Any("error", err))
    }
    if err := db.Create(&commits).Error; err != nil {
        slog.Error("Could not seed commits", slog.Any("error", err))
    }
    if err := db.Create(&diffs).Error; err != nil {
        slog.Error("Could not seed diffs", slog.Any("error", err))
    }
    if err := db.Create(&diffItems).Error; err != nil {
        slog.Error("Could not seed diff items", slog.Any("error", err))
    }

    slog.Info("Seeding completed successfully")
}
