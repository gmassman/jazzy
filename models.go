package main

import "go.mongodb.org/mongo-driver/bson/primitive"

// Sheet wraps a record from the jazzy.sheets collection
type Sheet struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Filename  string             `json:"filename"`
	Source    string             `json:"source"`
	PDFBase64 string             `json:"contents"`
	Contents  []byte             `json:"-"`
	Page      int                `json:"page"`
	Song      string             `json:"song"`
	Composer  string             `json:"composer"`
}
