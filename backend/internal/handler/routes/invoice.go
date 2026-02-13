package routes

import (
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

func InvoiceRoutes(router *gin.Engine) {
	handler := service.NewInvoiceHandler()

	invoice := router.Group("/invoice")
	{
		invoice.POST("/generate", service.CreateInvoice)
	}
}
