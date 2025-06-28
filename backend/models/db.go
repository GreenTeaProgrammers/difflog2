package models

import (
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// ConnectDatabase initializes the database connection and migrates the models.
func ConnectDatabase(dsn string) *gorm.DB {
	if dsn == "" {
		log.Fatal("DATABASE_DSN is not set")
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("Database connection successfully established")

	// Auto-migrate models
	err = db.AutoMigrate(&User{}, &Location{}, &Capture{}, &Commit{}, &Diff{}, &DiffItem{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	fmt.Println("Database migration successfully completed")

	return db
}
