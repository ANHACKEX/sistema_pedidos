import React, { useState } from 'react';
import { Plus, Search, ShoppingCart, Eye, Edit, Trash2, Filter, Calendar, User, Package } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { PDFGenerator } from '../utils/pdf';
import { Sale, Customer, Product } from '../types';

const SalesPage: React.FC = () => {
  const { sales, customers, products, company, addSale, updateSale, deleteSale } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; saleId: string }>({ isOpen: false, saleId: '' });
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    items: [{ productId: '', quantity: 1, price: 0 }],
    discount: 0,
    paymentMethod: 'cash',
    deliveryFee: 0,
    notes: '',
    deliveryAddress: {
      street: '',
      number: '',
      district: '',
      city: '',
      zipCode: '',
      complement: '',
      reference: ''
    }
  });

  const filteredSales = sales.filter(sale => {
    const customer = customers.find(c => c.id === sale.customerId);
    const matchesSearch = customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (sale?: Sale) => {
    if (sale) {
      setEditingSale(sale);
      const customer = customers.find(c => c.id === sale.customerId);
      setFormData({
        customerId: sale.customerId,
        items: sale.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        discount: sale.discount,
        paymentMethod: sale.paymentMethod,
        deliveryFee: sale.deliveryFee,
        notes: sale.notes || '',
        deliveryAddress: sale.deliveryAddress || customer?.address || {
          street: '',
          number: '',
          district: '',
          city: '',
          zipCode: '',
          complement: '',
          reference: ''
        }
      });
    } else {
      setEditingSale(null);
      setFormData({
        customerId: '',
        items: [{ productId: '', quantity: 1, price: 0 }],
        discount: 0,
        paymentMethod: 'cash',
        deliveryFee: 0,
        notes: '',
        deliveryAddress: {
          street: '',
          number: '',
          district: '',
          city: '',
          zipCode: '',
          complement: '',
          reference: ''
        }
      });
    }
    setIsModalOpen(true);
  };

  const handleViewSale = (sale: Sale) => {
    setViewingSale(sale);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsViewModalOpen(false);
    setEditingSale(null);
    setViewingSale(null);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = formData.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          updatedItem.price = product?.price || 0;
        }
        return updatedItem;
      }
      return item;
    });
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - formData.discount + formData.deliveryFee;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subtotal = calculateSubtotal();
    const total = calculateTotal();
    
    const saleData = {
      customerId: formData.customerId,
      items: formData.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          productName: product?.name || '',
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price
        };
      }),
      subtotal,
      discount: formData.discount,
      total,
      date: new Date(),
      status: 'pending' as const,
      paymentMethod: formData.paymentMethod,
      sellerId: '1', // Current user ID
      deliveryFee: formData.deliveryFee,
      notes: formData.notes,
      deliveryAddress: formData.deliveryAddress
    };

    if (editingSale) {
      updateSale(editingSale.id, saleData);
    } else {
      addSale(saleData);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({ isOpen: true, saleId: id });
  };

  const confirmDelete = () => {
    deleteSale(confirmDialog.saleId);
    setConfirmDialog({ isOpen: false, saleId: '' });
  };

  const printSaleReceipt = (sale: Sale) => {
    const customer = customers.find(c => c.id === sale.customerId);
    if (customer) {
      PDFGenerator.generateSaleReceipt(sale, customer, company);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Entregue';
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendente';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestão de Vendas</h1>
          <p className="text-gray-600 mt-1">Controle completo das suas vendas</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar vendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredSales.map((sale) => {
            const customer = customers.find(c => c.id === sale.customerId);
            return (
              <div key={sale.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Venda #{sale.id.slice(-6)}</h3>
                    <p className="text-sm text-gray-600">{customer?.name}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sale.status)}`}>
                    {getStatusText(sale.status)}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium">{new Date(sale.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-green-600">R$ {sale.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Itens:</span>
                    <span className="font-medium">{sale.items.length}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewSale(sale)}>
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleOpenModal(sale)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => printSaleReceipt(sale)}>
                      Imprimir
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(sale.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <span className="text-xs text-gray-500 capitalize">{sale.paymentMethod}</span>
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
                <th className="text-left py-3 px-2 font-medium text-gray-600">Venda</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Cliente</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Data</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Itens</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Total</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.map((sale) => {
                const customer = customers.find(c => c.id === sale.customerId);
                return (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">#{sale.id.slice(-6)}</p>
                          <p className="text-sm text-gray-500 capitalize">{sale.paymentMethod}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{customer?.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-gray-600">
                      {new Date(sale.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{sale.items.length} itens</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className="font-bold text-green-600">R$ {sale.total.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                        {getStatusText(sale.status)}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewSale(sale)}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOpenModal(sale)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => printSaleReceipt(sale)}>
                          Imprimir
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(sale.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredSales.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma venda encontrada</p>
            </div>
          )}
        </div>
      </Card>

      {/* Sale Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSale ? 'Editar Venda' : 'Nova Venda'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um cliente</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cash">Dinheiro</option>
                <option value="card">Cartão</option>
                <option value="pix">PIX</option>
                <option value="credit">Crediário</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Itens da Venda</h4>
              <Button type="button" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    >
                      <option value="">Selecione um produto</option>
                      {products.filter(p => p.isActive).map(product => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Qtd"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Preço"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      R$ {(item.quantity * item.price).toFixed(2)}
                    </span>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Desconto (R$)"
              type="number"
              step="0.01"
              value={formData.discount}
              onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
            />
            <Input
              label="Taxa de Entrega (R$)"
              type="number"
              step="0.01"
              value={formData.deliveryFee}
              onChange={(e) => setFormData({...formData, deliveryFee: parseFloat(e.target.value) || 0})}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
              <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-lg font-bold text-green-600">
                R$ {calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observações sobre a venda..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingSale ? 'Atualizar' : 'Criar'} Venda
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Sale Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={handleCloseModal}
        title={`Venda #${viewingSale?.id.slice(-6)}`}
        size="lg"
      >
        {viewingSale && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Informações da Venda</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium">{new Date(viewingSale.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewingSale.status)}`}>
                      {getStatusText(viewingSale.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pagamento:</span>
                    <span className="font-medium capitalize">{viewingSale.paymentMethod}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
                <div className="text-sm">
                  <p className="font-medium">{customers.find(c => c.id === viewingSale.customerId)?.name}</p>
                  <p className="text-gray-600">{customers.find(c => c.id === viewingSale.customerId)?.phone}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Itens</h4>
              <div className="space-y-2">
                {viewingSale.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">{item.quantity}x R$ {item.price.toFixed(2)}</p>
                    </div>
                    <span className="font-medium text-gray-900">R$ {item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">R$ {viewingSale.subtotal.toFixed(2)}</span>
                </div>
                {viewingSale.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Desconto:</span>
                    <span className="font-medium text-red-600">- R$ {viewingSale.discount.toFixed(2)}</span>
                  </div>
                )}
                {viewingSale.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxa de Entrega:</span>
                    <span className="font-medium">R$ {viewingSale.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {viewingSale.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {viewingSale.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{viewingSale.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, saleId: '' })}
        onConfirm={confirmDelete}
        title="Excluir Venda"
        message="Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default SalesPage;