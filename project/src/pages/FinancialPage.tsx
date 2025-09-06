import React, { useState } from 'react';
import { Plus, Search, DollarSign, TrendingUp, TrendingDown, Calendar, Filter, Eye, Edit, Trash2, FileText, Receipt } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const FinancialPage: React.FC = () => {
  const { transactions, customers, addTransaction, updateTransaction, deleteTransaction } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; transactionId: string }>({ isOpen: false, transactionId: '' });
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    dueDate: '',
    status: 'pending' as 'pending' | 'paid' | 'overdue' | 'cancelled',
    paymentMethod: '',
    customerId: '',
    installments: 1,
    currentInstallment: 1
  });
  const [invoiceData, setInvoiceData] = useState({
    type: 'nfe' as 'nfe' | 'nfce' | 'receipt',
    customerId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    observations: '',
    issueDate: new Date().toISOString().slice(0, 10)
  });

  const filteredTransactions = transactions.filter(transaction => {
    const customer = transaction.customerId ? customers.find(c => c.id === transaction.customerId) : null;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate financial stats
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.date) >= thisMonth && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= thisMonth && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingReceivables = transactions
    .filter(t => t.type === 'income' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayables = transactions
    .filter(t => t.type === 'expense' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  // Chart data
  const monthlyData = [
    { month: 'Jan', income: 15000, expenses: 8000 },
    { month: 'Fev', income: 18000, expenses: 9500 },
    { month: 'Mar', income: 16500, expenses: 8800 },
    { month: 'Abr', income: 22000, expenses: 11000 },
    { month: 'Mai', income: 19500, expenses: 9800 },
    { month: 'Jun', income: monthlyIncome, expenses: monthlyExpenses }
  ];

  const categoryData = [
    { name: 'Vendas', value: 65, color: '#10B981' },
    { name: 'Serviços', value: 20, color: '#3B82F6' },
    { name: 'Outros', value: 15, color: '#F59E0B' }
  ];

  const expenseData = [
    { name: 'Fornecedores', value: 40, color: '#EF4444' },
    { name: 'Salários', value: 30, color: '#F59E0B' },
    { name: 'Operacional', value: 20, color: '#8B5CF6' },
    { name: 'Outros', value: 10, color: '#6B7280' }
  ];

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        amount: transaction.amount.toString(),
        date: new Date(transaction.date).toISOString().slice(0, 10),
        dueDate: transaction.dueDate ? new Date(transaction.dueDate).toISOString().slice(0, 10) : '',
        status: transaction.status,
        paymentMethod: transaction.paymentMethod || '',
        customerId: transaction.customerId || '',
        installments: transaction.installments || 1,
        currentInstallment: transaction.currentInstallment || 1
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        type: 'income',
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        dueDate: '',
        status: 'pending',
        paymentMethod: '',
        customerId: '',
        installments: 1,
        currentInstallment: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      type: formData.type,
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      status: formData.status,
      paymentMethod: formData.paymentMethod || undefined,
      customerId: formData.customerId || undefined,
      installments: formData.installments,
      currentInstallment: formData.currentInstallment
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({ isOpen: true, transactionId: id });
  };

  const confirmDelete = () => {
    deleteTransaction(confirmDialog.transactionId);
    setConfirmDialog({ isOpen: false, transactionId: '' });
  };

  const handleOpenInvoiceModal = () => {
    setInvoiceData({
      type: 'nfe',
      customerId: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      observations: '',
      issueDate: new Date().toISOString().slice(0, 10)
    });
    setIsInvoiceModalOpen(true);
  };

  const addInvoiceItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    });
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    const updatedItems = invoiceData.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    });
    setInvoiceData({ ...invoiceData, items: updatedItems });
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData({
        ...invoiceData,
        items: invoiceData.items.filter((_, i) => i !== index)
      });
    }
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const total = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    
    // Create transaction for the invoice
    addTransaction({
      type: 'income',
      category: 'Nota Fiscal',
      description: `${invoiceData.type.toUpperCase()} - ${invoiceData.items[0]?.description || 'Venda'}`,
      amount: total,
      date: new Date(invoiceData.issueDate),
      status: 'pending',
      customerId: invoiceData.customerId || undefined,
      paymentMethod: 'Nota Fiscal'
    });
    
    const event = new CustomEvent('showToast', {
      detail: { type: 'success', message: `${invoiceData.type.toUpperCase()} emitida com sucesso!` }
    });
    window.dispatchEvent(event);
    setIsInvoiceModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'overdue': return 'Vencido';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendente';
    }
  };

  const incomeCategories = ['Vendas', 'Serviços', 'Outros'];
  const expenseCategories = ['Fornecedores', 'Salários', 'Aluguel', 'Combustível', 'Manutenção', 'Marketing', 'Outros'];

  const paymentMethods = [
    'Dinheiro', 'PIX', 'Cartão de Débito', 'Cartão de Crédito', 
    'Transferência Bancária', 'Boleto', 'Cheque', 'Crediário'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestão Financeira</h1>
          <p className="text-gray-600 mt-1">Controle completo das suas finanças</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
          <Button onClick={handleOpenInvoiceModal} variant="outline" className="w-full sm:w-auto">
            <FileText className="w-4 h-4 mr-2" />
            Emitir Nota
          </Button>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="text-center hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-green-600 mb-1">
            R$ {monthlyIncome.toLocaleString('pt-BR')}
          </p>
          <p className="text-sm text-gray-600">Receitas do Mês</p>
        </Card>
        
        <Card className="text-center hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-3">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-red-600 mb-1">
            R$ {monthlyExpenses.toLocaleString('pt-BR')}
          </p>
          <p className="text-sm text-gray-600">Despesas do Mês</p>
        </Card>
        
        <Card className="text-center hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">
            R$ {pendingReceivables.toLocaleString('pt-BR')}
          </p>
          <p className="text-sm text-gray-600">A Receber</p>
        </Card>
        
        <Card className="text-center hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-orange-600 mb-1">
            R$ {pendingPayables.toLocaleString('pt-BR')}
          </p>
          <p className="text-sm text-gray-600">A Pagar</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Fluxo de Caixa Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value) => [`R$ ${value}`, '']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px' 
                }}
              />
              <Bar dataKey="income" fill="#10B981" name="Receitas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#EF4444" name="Despesas" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Receitas por Categoria</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Participação']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="overdue">Vencido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredTransactions.map((transaction) => {
            const customer = transaction.customerId ? customers.find(c => c.id === transaction.customerId) : null;
            return (
              <div key={transaction.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                      <p className="text-sm text-gray-600">{transaction.category}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                    {getStatusText(transaction.status)}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor:</span>
                    <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium">{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {customer && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cliente:</span>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleOpenModal(transaction)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(transaction.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {transaction.paymentMethod && (
                    <span className="text-xs text-gray-500 capitalize">{transaction.paymentMethod}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-600">Tipo</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Descrição</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Categoria</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Valor</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Data</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium capitalize">
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      {transaction.customerId && (
                        <p className="text-sm text-gray-500">
                          {customers.find(c => c.id === transaction.customerId)?.name}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-2 text-gray-600">{transaction.category}</td>
                  <td className="py-4 px-2">
                    <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-gray-600">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-4 px-2">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusText(transaction.status)}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenModal(transaction)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(transaction.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma transação encontrada</p>
            </div>
          )}
        </div>
      </Card>

      {/* Transaction Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as 'income' | 'expense'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione uma categoria</option>
                {(formData.type === 'income' ? incomeCategories : expenseCategories).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Vencido</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Data"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
            <Input
              label="Data de Vencimento"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Forma de Pagamento"
              list="payment-methods"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              placeholder="Selecione ou digite"
            />
            <datalist id="payment-methods">
              {paymentMethods.map(method => (
                <option key={method} value={method} />
              ))}
            </datalist>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (opcional)</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um cliente</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingTransaction ? 'Atualizar' : 'Adicionar'} Transação
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Emitir Nota Fiscal"
        size="xl"
      >
        <form onSubmit={handleInvoiceSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Nota</label>
              <select
                value={invoiceData.type}
                onChange={(e) => setInvoiceData({...invoiceData, type: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="nfe">NFe - Nota Fiscal Eletrônica</option>
                <option value="nfce">NFCe - Nota Fiscal Consumidor</option>
                <option value="receipt">Recibo Simples</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select
                value={invoiceData.customerId}
                onChange={(e) => setInvoiceData({...invoiceData, customerId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um cliente</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Data de Emissão"
              type="date"
              value={invoiceData.issueDate}
              onChange={(e) => setInvoiceData({...invoiceData, issueDate: e.target.value})}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Itens da Nota</h4>
              <Button type="button" size="sm" onClick={addInvoiceItem}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {invoiceData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Descrição do item"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Qtd"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Preço Unit."
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      R$ {item.total.toFixed(2)}
                    </span>
                    {invoiceData.items.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => removeInvoiceItem(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={invoiceData.observations}
              onChange={(e) => setInvoiceData({...invoiceData, observations: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observações da nota fiscal..."
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total da Nota:</span>
              <span className="text-2xl font-bold text-blue-600">
                R$ {invoiceData.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => setIsInvoiceModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Receipt className="w-4 h-4 mr-2" />
              Emitir Nota
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, transactionId: '' })}
        onConfirm={confirmDelete}
        title="Excluir Transação"
        message="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default FinancialPage;