package utils

import (
	"backend/internal/model/dto"
	"fmt"

	"github.com/jung-kurt/gofpdf"
)

func GenerateInvoicePDF(invoice dto.InvoiceResponse, path string) error {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "INVOICE")
	pdf.Ln(15)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, fmt.Sprintf("Invoice ID : %s", invoice.ID))
	pdf.Ln(8)

	pdf.Cell(40, 10, fmt.Sprintf("Email      : %s", invoice.Email))
	pdf.Ln(8)

	pdf.Cell(40, 10, fmt.Sprintf("Amount     : Rp %.2f", invoice.Amount))
	pdf.Ln(8)

	pdf.Cell(40, 10, fmt.Sprintf("Date       : %s", invoice.CreatedAt.Format("02 Jan 2006")))
	pdf.Ln(8)

	return pdf.OutputFileAndClose(path)
}
