import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Truck,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Bell
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/ui/Card';

const DashboardPage: React.FC = () => {
  const { dashboardStats, products, sales, deliveries, customers, transactions, users, company } = useData();
  const { isDark } = useTheme();

  // Calculate real stats from actual data
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlySales = sales.filter(s => new Date(s.date) >= thisMonth);
  const monthlyRevenue = monthlySales.reduce((sum, s) => sum + s.total, 0);
  const monthlyTransactions = transactions.filter(t => new Date(t.date) >= thisMonth);
  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income' && t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense' && t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock && p.isActive).length;
  const pendingDeliveries = deliveries.filter(d => d.status === 'pending' || d.status === 'in_transit').length;
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered').length;
  const averageTicket = monthlySales.length > 0 ? monthlyRevenue / monthlySales.length : 0;

  const salesData = [
    { month: 'Jan', sales: 4500, revenue: 12000, deliveries: 45 },
    { month: 'Fev', sales: 5200, revenue: 15500, deliveries: 52 },
    { month: 'Mar', sales: 4800, revenue: 13200, deliveries: 48 },
    { month: 'Abr', sales: 6100, revenue: 18500, deliveries: 61 },
    { month: 'Mai', sales: 5800, revenue: 17200, deliveries: 58 },
    { month: 'Jun', sales: monthlySales.length, revenue: monthlyRevenue, deliveries: completedDeliveries }
  ];

  const productData = [
    { name: 'Botijão P13', value: 45, color: '#3B82F6' },
    { name: 'Botijão P20', value: 25, color: '#10B981' },
    { name: 'Botijão P45', value: 20, color: '#F59E0B' },
    { name: 'Acessórios', value: 10, color: '#EF4444' }
  ];

  const recentSales = sales.slice(-5).reverse();
  const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.isActive).slice(0, 5);

  const statsCards = [
    {
      title: 'Vendas do Mês',
      value: monthlySales.length.toString(),
      icon: ShoppingCart,
      color: 'blue',
      change: '+12%',
      trend: 'up',
      subtitle: `Ticket médio: R$ ${averageTicket.toFixed(2)}`
    },
    {
      title: 'Total de Clientes',
      value: customers.length.toString(),
      icon: Users,
      color: 'green',
      change: '+5%',
      trend: 'up',
      subtitle: 'Clientes ativos'
    },
    {
      title: 'Entregas Pendentes',
      value: pendingDeliveries.toString(),
      icon: Truck,
      color: 'orange',
      change: '-8%',
      trend: 'down',
      subtitle: `${completedDeliveries} entregues`
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${monthlyRevenue.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: 'purple',
      change: '+18%',
      trend: 'up',
      subtitle: 'Faturamento bruto'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do seu negócio</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <Calendar className="w-4 h-4" />
            <span>Última atualização: {new Date().toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
            <Bell className="w-4 h-4" />
            <span>{lowStockCount} alertas</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {statsCards.map((stat, index) => {
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            green: 'bg-green-50 text-green-600 border-green-200',
            orange: 'bg-orange-50 text-orange-600 border-orange-200',
            purple: 'bg-purple-50 text-purple-600 border-purple-200'
          };

          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 min-h-[160px] p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-3 leading-tight">{stat.title}</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">{stat.value}</p>
                  <p className="text-sm text-gray-500 mb-4 leading-tight">{stat.subtitle}</p>
                  <div className="flex items-center">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">vs mês anterior</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl border ${colorClasses[stat.color]}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Receita e Vendas</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Receita</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Entregas</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  color: '#111827',
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  name === 'revenue' ? `R$ ${value}` : value,
                  name === 'revenue' ? 'Receita' : 'Entregas'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="deliveries" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorDeliveries)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Product Distribution */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Distribuição de Produtos</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={productData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Participação']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {productData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Vendas Recentes</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver todas
            </button>
          </div>
          <div className="space-y-4">
            {recentSales.length > 0 ? recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Venda #{sale.id.slice(-6)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(sale.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-lg">R$ {sale.total.toFixed(2)}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    sale.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    sale.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sale.status === 'delivered' ? 'Entregue' :
                     sale.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhuma venda recente</p>
              </div>
            )}
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Estoque Baixo</h3>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {dashboardStats.lowStockItems} itens
            </span>
          </div>
          <div className="space-y-4">
            {lowStockProducts.length > 0 ? lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600 text-lg">{product.stock} {product.unit}</p>
                  <p className="text-xs text-gray-500">Mín: {product.minStock}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Estoque em níveis normais</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Atividades Recentes</h3>
        <div className="space-y-4">
          {[
            { type: 'sale', message: 'Nova venda realizada - Cliente: João Silva', time: '2 min atrás', icon: ShoppingCart, color: 'green' },
            { type: 'stock', message: 'Estoque baixo - Botijão P13', time: '15 min atrás', icon: AlertTriangle, color: 'red' },
            { type: 'delivery', message: 'Entrega realizada - Pedido #12345', time: '30 min atrás', icon: Truck, color: 'blue' },
            { type: 'payment', message: 'Pagamento recebido - R$ 850,00', time: '1h atrás', icon: DollarSign, color: 'purple' },
            { type: 'customer', message: 'Novo cliente cadastrado - Maria Santos', time: '2h atrás', icon: Users, color: 'green' }
          ].map((activity, index) => {
            const colorClasses = {
              green: 'bg-green-100 text-green-600',
              red: 'bg-red-100 text-red-600',
              blue: 'bg-blue-100 text-blue-600',
              purple: 'bg-purple-100 text-purple-600'
            };

            return (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`p-3 rounded-lg ${colorClasses[activity.color]}`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.message}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
            <Bell className="w-4 h-4" />
            <span>{lowStockCount} alertas</span>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;