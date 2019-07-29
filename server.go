package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Server struct {
	*log.Logger
	*mongo.Database
	http.Handler
	mux *http.ServeMux
}

func NewServer(l *log.Logger, db *mongo.Database) *Server {
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:8080"},
		AllowCredentials: true,
		Debug:            true,
	})

	mux := http.DefaultServeMux

	return &Server{
		Logger:   l,
		Database: db,
		Handler:  c.Handler(mux),
		mux:      mux,
	}
}

func (s *Server) SetupRoutes() {
	s.mux.HandleFunc("/pdf", s.handlePDF())
	s.mux.HandleFunc("/pdfs", s.handlePagedPDF())
}

func (s *Server) handlePDF() http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
		contents, err := ioutil.ReadFile("/Users/garrett/go/src/github.com/gmassman/jazzy/helpers/Real-book-6/76.pdf")
		if err != nil {
			s.Logger.Printf("something went wrong: %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.Write(contents)
	}
}

func (s *Server) handlePagedPDF() http.HandlerFunc {
	// input := struct {
	// 	page int `json:"page"`
	// 	size int `json:"size"`
	// }{}
	type record struct {
		ID       primitive.ObjectID `json:"id" bson:"_id,omitempty"`
		Filename string             `json:"filename"`
		Source   string             `json:"source"`
		Contents []byte             `json:"contents"`
	}
	return func(w http.ResponseWriter, req *http.Request) {
		results := []*record{}
		filter := bson.D{}
		findOptions := options.Find()
		findOptions.SetLimit(10)

		cur, err := s.Database.Collection("sheets").Find(req.Context(), filter, findOptions)
		if err != nil {
			s.Logger.Printf("DB find failed: %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		// unsupported in driver version 1.0.4, need to wait until 1.1.0 is released
		// err = cur.All(req.Context(), &results)
		for cur.Next(req.Context()) {
			var r record
			err := cur.Decode(&r)
			if err != nil {
				s.Logger.Printf("DB decode failed: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			results = append(results, &r)
		}

		if err := cur.Err(); err != nil {
			s.Logger.Printf("close cursor failed: %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		cur.Close(req.Context())

		err = json.NewEncoder(w).Encode(results)
		if err != nil {
			s.Logger.Printf("encode results failed: %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	}
}
