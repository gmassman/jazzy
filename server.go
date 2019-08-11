package main

import (
	"encoding/base64"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Server exposes the application routes
type Server struct {
	*log.Logger
	*mongo.Database
	http.Handler
	mux *http.ServeMux
}

// NewServer returns a new server with routes configured and CORS enabled
func NewServer(l *log.Logger, db *mongo.Database) *Server {
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:8080"},
		AllowCredentials: true,
		Debug:            true,
	})

	mux := http.DefaultServeMux

	srv := Server{
		Logger:   l,
		Database: db,
		Handler:  c.Handler(mux),
		mux:      mux,
	}

	srv.setupRoutes()

	return &srv
}

func (s *Server) setupRoutes() {
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
	const pageSize = 10
	var pageNumber int
	var err error

	return func(w http.ResponseWriter, req *http.Request) {
		q := req.URL.Query()
		page, exists := q["page"]
		if exists && len(page) == 1 {
			pageNumber, err = strconv.Atoi(page[0])
			if err != nil {
				s.Logger.Printf("bad query string in URL: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
		}

		results := []*Sheet{}
		filter := bson.D{}
		findOptions := options.Find()
		findOptions.SetSort(bson.D{{"page", 1}})
		findOptions.SetSkip(int64(pageNumber * pageSize))
		findOptions.SetLimit(pageSize)

		cur, err := s.Database.Collection("sheets").Find(req.Context(), filter, findOptions)
		if err != nil {
			s.Logger.Printf("DB find failed: %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		for cur.Next(req.Context()) {
			var r Sheet
			err := cur.Decode(&r)
			if err != nil {
				s.Logger.Printf("DB decode failed: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			r.PDFBase64 = base64.StdEncoding.EncodeToString(r.Contents)

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
