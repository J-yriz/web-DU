package dto

import "time"

type InvoiceResponse struct {
	ID            string    `json:"id"`
	InvoiceNumber string    `json:"invoice_number"`
	Email         string    `json:"email"`
	Amount        float64   `json:"amount"`
	Currency      string    `json:"currency"`
	Status        string    `json:"status"`
	FileURL       string    `json:"file_url"`
	CreatedAt     time.Time `json:"created_at"`
}
