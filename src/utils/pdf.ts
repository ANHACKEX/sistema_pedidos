// PDF generation utilities
export class PDFGenerator {
  static generateSaleReceipt(sale: any, customer: any, company: any): void {
    // Create a simple HTML structure for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo de Venda #${sale.id.slice(-6)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #2563EB; }
          .company-info { margin-top: 10px; color: #666; }
          .sale-info { margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f5f5f5; }
          .total-section { margin-top: 20px; text-align: right; }
          .total-line { margin: 5px 0; }
          .total-final { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${company.name}</div>
          <div class="company-info">
            ${company.document} | ${company.phone}<br>
            ${company.address.street}, ${company.address.number} - ${company.address.city}
          </div>
        </div>

        <div class="sale-info">
          <h2>Recibo de Venda #${sale.id.slice(-6)}</h2>
          <p><strong>Data:</strong> ${new Date(sale.date).toLocaleDateString('pt-BR')}</p>
          <p><strong>Cliente:</strong> ${customer.name}</p>
          <p><strong>Documento:</strong> ${customer.document}</p>
          <p><strong>Telefone:</strong> ${customer.phone}</p>
          <p><strong>Forma de Pagamento:</strong> ${sale.paymentMethod}</p>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Preço Unit.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map((item: any) => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>R$ ${item.price.toFixed(2)}</td>
                <td>R$ ${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-line">Subtotal: R$ ${sale.subtotal.toFixed(2)}</div>
          ${sale.discount > 0 ? `<div class="total-line">Desconto: R$ ${sale.discount.toFixed(2)}</div>` : ''}
          ${sale.deliveryFee > 0 ? `<div class="total-line">Taxa de Entrega: R$ ${sale.deliveryFee.toFixed(2)}</div>` : ''}
          <div class="total-final">Total: R$ ${sale.total.toFixed(2)}</div>
        </div>

        <div class="footer">
          <p>Obrigado pela preferência!</p>
          <p>Sistema Gas Gestão+ - ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }

  static generateDeliveryList(deliveries: any[], customers: any[], users: any[]): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lista de Entregas</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .delivery-item { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
          .delivery-header { font-weight: bold; color: #2563EB; margin-bottom: 10px; }
          .delivery-info { margin: 5px 0; }
          .items-list { margin: 10px 0; padding-left: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Lista de Entregas - ${new Date().toLocaleDateString('pt-BR')}</h1>
        </div>

        ${deliveries.map(delivery => {
          const customer = customers.find(c => c.id === delivery.customerId);
          const deliveryPerson = users.find(u => u.id === delivery.deliveryPersonId);
          
          return `
            <div class="delivery-item">
              <div class="delivery-header">Entrega #${delivery.id.slice(-6)}</div>
              <div class="delivery-info"><strong>Cliente:</strong> ${customer?.name}</div>
              <div class="delivery-info"><strong>Telefone:</strong> ${customer?.phone}</div>
              <div class="delivery-info"><strong>Endereço:</strong> ${delivery.address.street}, ${delivery.address.number} - ${delivery.address.district}</div>
              <div class="delivery-info"><strong>Entregador:</strong> ${deliveryPerson?.name}</div>
              <div class="delivery-info"><strong>Data Agendada:</strong> ${new Date(delivery.scheduledDate).toLocaleString('pt-BR')}</div>
              <div class="delivery-info"><strong>Status:</strong> ${delivery.status}</div>
              <div class="items-list">
                <strong>Itens:</strong>
                <ul>
                  ${delivery.items.map((item: any) => `<li>${item.productName} - ${item.quantity}x</li>`).join('')}
                </ul>
              </div>
              ${delivery.notes ? `<div class="delivery-info"><strong>Observações:</strong> ${delivery.notes}</div>` : ''}
            </div>
          `;
        }).join('')}
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}