import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, Users, Package, DollarSign, Truck, BarChart3 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { PDFGenerator } from '../utils/pdf';
import { ExcelExporter } from '../utils/excel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const ReportsPage: React.FC = () => {
  const { sales, customers, products, transactions, deliveries } = useData();
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10)
  });
  const [selectedReport, setSelectedReport] = useState('sales');

  // Filter data by date range
  const filterByDateRange = (data: any[], dateField: string) => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= start && itemDate <= end;
    });
  };

  const filteredSales = filterByDateRange(sales, 'date');
  const filteredTransactions = filterByDateRange(transactions, 'date');
  const filteredDeliveries = filterByDateRange(deliveries, 'scheduledDate');

  // Calculate metrics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = filteredSales.length;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  const totalCustomers = new Set(filteredSales.map(sale => sale.customerId)).size;

  // Sales by day
  const salesByDay = filteredSales.reduce((acc, sale) => {
    const date = new Date(sale.date).toLocaleDateString('pt-BR');
    acc[date] = (acc[date] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);

  const salesChartData = Object.entries(salesByDay).map(([date, total]) => ({
    date,
    total
  })).slice(-30); // Last 30 days

  // Top products
  const productSales = filteredSales.reduce((acc, sale) => {
    sale.items.forEach(item => {
      if (!acc[item.productId]) {
        acc[item.productId] = {
          name: item.productName,
          quantity: 0,
          revenue: 0
        };
      }
      acc[item.productId].quantity += item.quantity;
      acc[item.productId].revenue += item.total;
    });
    return acc;
  }, {} as Record<string, any>);

  const topProducts = Object.values(productSales)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 10);

  // Customer analysis
  const customerPurchases = filteredSales.reduce((acc, sale) => {
    const customer = customers.find(c => c.id === sale.customerId);
    if (customer) {
      if (!acc[customer.id]) {
        acc[customer.id] = {
          name: customer.name,
          purchases: 0,
          total: 0
        };
      }
      acc[customer.id].purchases += 1;
      acc[customer.id].total += sale.total;
    }
    return acc;
  }, {} as Record<string, any>);

  const topCustomers = Object.values(customerPurchases)
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 10);

  // Financial data
  const income = filteredTransactions
    .filter(t => t.type === 'income' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = filteredTransactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = income - expenses;

  // Delivery stats
  const deliveryStats = {
    total: filteredDeliveries.length,
    delivered: filteredDeliveries.filter(d => d.status === 'delivered').length,
    pending: filteredDeliveries.filter(d => d.status === 'pending').length,
    inTransit: filteredDeliveries.filter(d => d.status === 'in_transit').length,
    failed: filteredDeliveries.filter(d => d.status === 'failed').length
  };

  const deliveryChartData = [
    { name: 'Entregues', value: deliveryStats.delivered, color: '#10B981' },
    { name: 'Pendentes', value: deliveryStats.pending, color: '#F59E0B' },
    { name: 'Em Trânsito', value: deliveryStats.inTransit, color: '#3B82F6' },
    { name: 'Falharam', value: deliveryStats.failed, color: '#EF4444' }
  ];

  const exportReport = (type: string) => {
    switch (selectedReport) {
      case 'sales':
        if (type === 'excel') {
          ExcelExporter.exportSalesReport(filteredSales, customers);
        }
        break;
      case 'customers':
        if (type === 'excel') {
          ExcelExporter.exportCustomersReport(customers);
        }
        break;
      case 'products':
        if (type === 'excel') {
          ExcelExporter.exportProductsReport(products);
        }
        break;
      case 'financial':
        if (type === 'excel') {
          ExcelExporter.exportFinancialReport(filteredTransactions);
        }
        break;
      case 'deliveries':
        if (type === 'pdf') {
          PDFGenerator.generateDeliveryList(filteredDeliveries, customers, users);
        }
        break;
    }
  };

  const reportTypes = [
    { id: 'sales', name: 'Vendas', icon: TrendingUp },
    { id: 'financial', name: 'Financeiro', icon: DollarSign },
    { id: 'customers', name: 'Clientes', icon: Users },
    { id: 'products', name: 'Produtos', icon: Package },
    { id: 'deliveries', name: 'Entregas', icon: Truck }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análises detalhadas do seu negócio</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Período:</span>
            </div>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-auto"
            />
            <span className="text-gray-500">até</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-auto"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="text-center hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-green-600 mb-1">
            R$ {totalRevenue.toLocaleString('pt-BR')}
          </p>
          <p className="text-sm text-gray-600">Receita Total</p>
        </Card>
        
        <Card className="text-center hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">
            {totalSales}
          </p>
          <p className="text-sm text-gray-600">Total de Vendas</p>
        </Card>
        
        <Card className="text-center hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-purple-600 mb-1">
            {totalCustomers}
          </p>
          <p className="text-sm text-gray-600">Clientes Únicos</p>
        </Card>
        
        <Card className="text-center hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-orange-600 mb-1">
            R$ {averageTicket.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Ticket Médio</p>
        </Card>
      </div>

      {/* Charts based on selected report */}
      {selectedReport === 'sales' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Vendas por Dia</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => [`R$ ${value}`, 'Total']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px' 
                  }}
                />
                <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top 10 Produtos</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {topProducts.map((product: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.quantity} vendidos</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">R$ {product.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {selectedReport === 'financial' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumo Financeiro</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600 mb-2">R$ {income.toLocaleString('pt-BR')}</p>
                <p className="text-sm text-gray-600">Receitas</p>
              </div>
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600 mb-2">R$ {expenses.toLocaleString('pt-BR')}</p>
                <p className="text-sm text-gray-600">Despesas</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <p className={`text-3xl font-bold mb-2 ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  R$ {profit.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-gray-600">Lucro</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Margem de Lucro</h3>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {income > 0 ? ((profit / income) * 100).toFixed(1) : '0.0'}%
              </div>
              <p className="text-sm text-gray-600">Margem sobre receita</p>
            </div>
          </Card>
        </div>
      )}

      {selectedReport === 'customers' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top 10 Clientes</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {topCustomers.map((customer: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.purchases} compras</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">R$ {customer.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Análise de Clientes</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Total de Clientes</span>
                <span className="text-2xl font-bold text-blue-600">{customers.length}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-gray-700">Clientes Ativos</span>
                <span className="text-2xl font-bold text-green-600">{totalCustomers}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="text-gray-700">Ticket Médio</span>
                <span className="text-2xl font-bold text-purple-600">R$ {averageTicket.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {selectedReport === 'deliveries' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Status das Entregas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deliveryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deliveryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {deliveryChartData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Estatísticas de Entrega</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Total de Entregas</span>
                <span className="text-2xl font-bold text-blue-600">{deliveryStats.total}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-gray-700">Taxa de Sucesso</span>
                <span className="text-2xl font-bold text-green-600">
                  {deliveryStats.total > 0 ? ((deliveryStats.delivered / deliveryStats.total) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <span className="text-gray-700">Entregas Pendentes</span>
                <span className="text-2xl font-bold text-orange-600">{deliveryStats.pending}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {selectedReport === 'products' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Produtos Mais Vendidos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => [value, 'Quantidade']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px' 
                  }}
                />
                <Bar dataKey="quantity" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Análise de Estoque</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Total de Produtos</span>
                <span className="text-2xl font-bold text-blue-600">{products.length}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <span className="text-gray-700">Estoque Baixo</span>
                <span className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.stock <= p.minStock && p.isActive).length}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-gray-700">Produtos Ativos</span>
                <span className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.isActive).length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;