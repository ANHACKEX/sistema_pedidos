import React, { useState } from 'react';
import { Plus, Search, Truck, MapPin, Clock, CheckCircle, XCircle, Eye, Edit, Calendar, User, Package } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Delivery, Sale, Customer } from '../types';

const DeliveriesPage: React.FC = () => {
  const { deliveries, sales, customers, users, addDelivery, updateDelivery } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [viewingDelivery, setViewingDelivery] = useState<Delivery | null>(null);
  const [formData, setFormData] = useState({
    saleId: '',
    deliveryPersonId: '',
    scheduledDate: '',
    notes: '',
    route: ''
  });

  const availableSales = sales.filter(sale => 
    sale.status === 'confirmed' && 
    !deliveries.some(delivery => delivery.saleId === sale.id)
  );

  const filteredDeliveries = deliveries.filter(delivery => {
    const customer = customers.find(c => c.id === delivery.customerId);
    const deliveryPerson = users.find(u => u.id === delivery.deliveryPersonId);
    const matchesSearch = customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deliveryPerson?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (delivery?: Delivery) => {
    if (delivery) {
      setEditingDelivery(delivery);
      setFormData({
        saleId: delivery.saleId,
        deliveryPersonId: delivery.deliveryPersonId,
        scheduledDate: new Date(delivery.scheduledDate).toISOString().slice(0, 16),
        notes: delivery.notes || '',
        route: delivery.route || ''
      });
    } else {
      setEditingDelivery(null);
      setFormData({
        saleId: '',
        deliveryPersonId: '',
        scheduledDate: '',
        notes: '',
        route: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleViewDelivery = (delivery: Delivery) => {
    setViewingDelivery(delivery);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsViewModalOpen(false);
    setEditingDelivery(null);
    setViewingDelivery(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sale = sales.find(s => s.id === formData.saleId);
    if (!sale) return;

    const customer = customers.find(c => c.id === sale.customerId);
    if (!customer) return;

    const deliveryData = {
      saleId: formData.saleId,
      customerId: sale.customerId,
      deliveryPersonId: formData.deliveryPersonId,
      status: 'pending' as const,
      scheduledDate: new Date(formData.scheduledDate),
      address: sale.deliveryAddress || customer.address,
      items: sale.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity
      })),
      deliveryFee: sale.deliveryFee,
      notes: formData.notes,
      route: formData.route
    };

    if (editingDelivery) {
      updateDelivery(editingDelivery.id, deliveryData);
    } else {
      addDelivery(deliveryData);
    }

    handleCloseModal();
  };

  const updateDeliveryStatus = (id: string, status: Delivery['status']) => {
    const updates: Partial<Delivery> = { status };
    if (status === 'delivered') {
      updates.deliveredDate = new Date();
    }
    updateDelivery(id, updates);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Entregue';
      case 'in_transit': return 'Em Trânsito';
      case 'failed': return 'Falhou';
      default: return 'Pendente';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return CheckCircle;
      case 'in_transit': return Truck;
      case 'failed': return XCircle;
      default: return Clock;
    }
  };

  const deliveryPersons = users.filter(u => u.role === 'delivery' && u.isActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestão de Entregas</h1>
          <p className="text-gray-600 mt-1">Controle completo das suas entregas</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nova Entrega
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {deliveries.filter(d => d.status === 'pending').length}
          </p>
          <p className="text-sm text-gray-600">Pendentes</p>
        </Card>
        
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <Truck className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {deliveries.filter(d => d.status === 'in_transit').length}
          </p>
          <p className="text-sm text-gray-600">Em Trânsito</p>
        </Card>
        
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {deliveries.filter(d => d.status === 'delivered').length}
          </p>
          <p className="text-sm text-gray-600">Entregues</p>
        </Card>
        
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-3">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {deliveries.filter(d => d.status === 'failed').length}
          </p>
          <p className="text-sm text-gray-600">Falharam</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar entregas..."
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
              <option value="in_transit">Em Trânsito</option>
              <option value="delivered">Entregue</option>
              <option value="failed">Falhou</option>
            </select>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredDeliveries.map((delivery) => {
            const customer = customers.find(c => c.id === delivery.customerId);
            const deliveryPerson = users.find(u => u.id === delivery.deliveryPersonId);
            const StatusIcon = getStatusIcon(delivery.status);
            
            return (
              <div key={delivery.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(delivery.status).replace('text-', 'bg-').replace('800', '100')}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Entrega #{delivery.id.slice(-6)}</h3>
                      <p className="text-sm text-gray-600">{customer?.name}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                    {getStatusText(delivery.status)}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(delivery.scheduledDate).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    {deliveryPerson?.name}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {delivery.address.street}, {delivery.address.number}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewDelivery(delivery)}>
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleOpenModal(delivery)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    {delivery.status === 'pending' && (
                      <Button size="sm" onClick={() => updateDeliveryStatus(delivery.id, 'in_transit')}>
                        Iniciar
                      </Button>
                    )}
                    {delivery.status === 'in_transit' && (
                      <Button size="sm" variant="success" onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}>
                        Entregar
                      </Button>
                    )}
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    R$ {delivery.deliveryFee.toFixed(2)}
                  </span>
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
                <th className="text-left py-3 px-2 font-medium text-gray-600">Entrega</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Cliente</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Entregador</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Data</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Endereço</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => {
                const customer = customers.find(c => c.id === delivery.customerId);
                const deliveryPerson = users.find(u => u.id === delivery.deliveryPersonId);
                const StatusIcon = getStatusIcon(delivery.status);
                
                return (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(delivery.status).replace('text-', 'bg-').replace('800', '100')}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">#{delivery.id.slice(-6)}</p>
                          <p className="text-sm text-gray-500">{delivery.items.length} itens</p>
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
                      {deliveryPerson?.name}
                    </td>
                    <td className="py-4 px-2 text-gray-600">
                      {new Date(delivery.scheduledDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 truncate max-w-xs">
                          {delivery.address.street}, {delivery.address.number}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                        {getStatusText(delivery.status)}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewDelivery(delivery)}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOpenModal(delivery)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        {delivery.status === 'pending' && (
                          <Button size="sm" onClick={() => updateDeliveryStatus(delivery.id, 'in_transit')}>
                            Iniciar
                          </Button>
                        )}
                        {delivery.status === 'in_transit' && (
                          <Button size="sm" variant="success" onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}>
                            Entregar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredDeliveries.length === 0 && (
            <div className="text-center py-12">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma entrega encontrada</p>
            </div>
          )}
        </div>
      </Card>

      {/* Delivery Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDelivery ? 'Editar Entrega' : 'Nova Entrega'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venda</label>
              <select
                value={formData.saleId}
                onChange={(e) => setFormData({...formData, saleId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!!editingDelivery}
              >
                <option value="">Selecione uma venda</option>
                {(editingDelivery ? sales : availableSales).map(sale => {
                  const customer = customers.find(c => c.id === sale.customerId);
                  return (
                    <option key={sale.id} value={sale.id}>
                      Venda #{sale.id.slice(-6)} - {customer?.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entregador</label>
              <select
                value={formData.deliveryPersonId}
                onChange={(e) => setFormData({...formData, deliveryPersonId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um entregador</option>
                {deliveryPersons.map(person => (
                  <option key={person.id} value={person.id}>{person.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Data/Hora Agendada"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
              required
            />
            <Input
              label="Rota"
              value={formData.route}
              onChange={(e) => setFormData({...formData, route: e.target.value})}
              placeholder="Ex: Rota A, Centro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observações sobre a entrega..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingDelivery ? 'Atualizar' : 'Criar'} Entrega
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Delivery Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={handleCloseModal}
        title={`Entrega #${viewingDelivery?.id.slice(-6)}`}
        size="lg"
      >
        {viewingDelivery && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Informações da Entrega</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Agendada:</span>
                    <span className="font-medium">{new Date(viewingDelivery.scheduledDate).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewingDelivery.status)}`}>
                      {getStatusText(viewingDelivery.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxa de Entrega:</span>
                    <span className="font-medium">R$ {viewingDelivery.deliveryFee.toFixed(2)}</span>
                  </div>
                  {viewingDelivery.deliveredDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data de Entrega:</span>
                      <span className="font-medium">{new Date(viewingDelivery.deliveredDate).toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Cliente e Entregador</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Cliente:</span>
                    <p className="font-medium">{customers.find(c => c.id === viewingDelivery.customerId)?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Entregador:</span>
                    <p className="font-medium">{users.find(u => u.id === viewingDelivery.deliveryPersonId)?.name}</p>
                  </div>
                  {viewingDelivery.route && (
                    <div>
                      <span className="text-gray-600">Rota:</span>
                      <p className="font-medium">{viewingDelivery.route}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Endereço de Entrega</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">
                  {viewingDelivery.address.street}, {viewingDelivery.address.number}
                  {viewingDelivery.address.complement && `, ${viewingDelivery.address.complement}`}
                </p>
                <p className="text-sm text-gray-600">
                  {viewingDelivery.address.district}, {viewingDelivery.address.city} - {viewingDelivery.address.zipCode}
                </p>
                {viewingDelivery.address.reference && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Referência:</strong> {viewingDelivery.address.reference}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Itens para Entrega</h4>
              <div className="space-y-2">
                {viewingDelivery.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{item.productName}</span>
                    </div>
                    <span className="text-sm text-gray-600">{item.quantity}x</span>
                  </div>
                ))}
              </div>
            </div>

            {viewingDelivery.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{viewingDelivery.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeliveriesPage;