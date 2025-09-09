// Excel export utilities
export class ExcelExporter {
  static exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportSalesReport(sales: any[], customers: any[]): void {
    const salesData = sales.map(sale => {
      const customer = customers.find(c => c.id === sale.customerId);
      return {
        'ID da Venda': sale.id,
        'Data': new Date(sale.date).toLocaleDateString('pt-BR'),
        'Cliente': customer?.name || 'N/A',
        'Documento': customer?.document || 'N/A',
        'Subtotal': sale.subtotal,
        'Desconto': sale.discount,
        'Taxa de Entrega': sale.deliveryFee,
        'Total': sale.total,
        'Forma de Pagamento': sale.paymentMethod,
        'Status': sale.status,
        'Itens': sale.items.length
      };
    });

    this.exportToCSV(salesData, 'relatorio-vendas');
  }

  static exportCustomersReport(customers: any[]): void {
    const customersData = customers.map(customer => ({
      'ID': customer.id,
      'Nome': customer.name,
      'Documento': customer.document,
      'Telefone': customer.phone,
      'Email': customer.email || 'N/A',
      'Cidade': customer.address.city,
      'Bairro': customer.address.district,
      'Total de Compras': customer.totalPurchases,
      'Última Compra': customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString('pt-BR') : 'N/A',
      'Status': customer.isActive ? 'Ativo' : 'Inativo'
    }));

    this.exportToCSV(customersData, 'relatorio-clientes');
  }

  static exportProductsReport(products: any[]): void {
    const productsData = products.map(product => ({
      'ID': product.id,
      'Nome': product.name,
      'Categoria': product.category,
      'Preço': product.price,
      'Estoque Atual': product.stock,
      'Estoque Mínimo': product.minStock,
      'Unidade': product.unit,
      'Fornecedor': product.supplier || 'N/A',
      'Status': product.isActive ? 'Ativo' : 'Inativo'
    }));

    this.exportToCSV(productsData, 'relatorio-produtos');
  }

  static exportFinancialReport(transactions: any[]): void {
    const financialData = transactions.map(transaction => ({
      'ID': transaction.id,
      'Data': new Date(transaction.date).toLocaleDateString('pt-BR'),
      'Tipo': transaction.type === 'income' ? 'Receita' : 'Despesa',
      'Categoria': transaction.category,
      'Descrição': transaction.description,
      'Valor': transaction.amount,
      'Status': transaction.status,
      'Forma de Pagamento': transaction.paymentMethod || 'N/A',
      'Data de Vencimento': transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString('pt-BR') : 'N/A'
    }));

    this.exportToCSV(financialData, 'relatorio-financeiro');
  }
}