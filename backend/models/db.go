package models

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// ConnectDatabase initializes the database connection and migrates the models.
func ConnectDatabase() {
	dsn := os.Getenv("DATABASE_DSN")
	if dsn == "" {
		log.Fatal("DATABASE_DSN environment variable not set")
	}

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("Database connection successfully established")

	// Auto-migrate models
	err = DB.AutoMigrate(&User{}, &Location{}, &Capture{}, &Commit{}, &Diff{}, &DiffItem{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	fmt.Println("Database migration successfully completed")
}

// SetDatabase sets the database instance for the models package.
func SetDatabase(database *gorm.DB) {
	DB = database
}
