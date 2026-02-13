package service

import (
	"fmt"
	"time"

	"backend/internal/model/dto"
	"backend/internal/utils"

	"github.com/google/uuid"
)

type InvoiceService struct {
	emailService *EmailService
}

func NewInvoiceService() *InvoiceService {
	return &InvoiceService{
		emailService: NewEmailService(),
	}
}

func (s *InvoiceService) GenerateAndSendInvoice(email string, amount float64) (string, error) {
	invoice := dto.InvoiceResponse{
		ID:        uuid.NewString(),
		Email: email,
		Amount:    amount,
		CreatedAt: time.Now(),
	}

	filePath := fmt.Sprintf("invoices/%s.pdf", invoice.ID)

	if err := utils.GenerateInvoicePDF(invoice, filePath); err != nil {
		return "", err
	}

	if err := s.emailService.SendInvoice(email, filePath); err != nil {
		return "", err
	}

	return filePath, nil
}
