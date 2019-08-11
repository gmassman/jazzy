package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	logger := log.New(os.Stdout, "", log.LstdFlags)
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	client, err := mongo.Connect(context.Background(), clientOptions)

	if err != nil {
		logger.Fatalf("failed to create mongo client: %v", err)
	}

	err = client.Ping(context.Background(), nil)

	if err != nil {
		logger.Fatalf("failed to ping mongo client: %v", err)
	}

	db := client.Database("jazzy")

	srv := NewServer(logger, db)

	logger.Println("starting the server on 3030...")
	err = http.ListenAndServe(":3030", srv.Handler)
	if err != nil {
		logger.Fatal("ListenAndServe: ", err)
	}
}
