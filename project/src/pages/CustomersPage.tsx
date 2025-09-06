import React, { useState } from 'react';
import { Plus, Search, User, MapPin, Phone, Edit, Trash2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Customer } from '../types';

const CustomersPage: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    phone: '',
    email: '',
    street: '',
    number: '',
    district: '',
    city: '',
    zipCode: ''
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.document.includes(searchTerm) ||
    customer.phone.includes(searchTerm)
  );

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        document: customer.document,
        phone: customer.phone,
        email: customer.email || '',
        street: customer.address.street,
        number: customer.address.number,
        district: customer.address.district,
        city: customer.address.city,
        zipCode: customer.address.zipCode
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        document: '',
        phone: '',
        email: '',
        street: '',
        number: '',
        district: '',
        city: '',
        zipCode: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerData = {
      name: formData.name,
      document: formData.document,
      phone: formData.phone,
      email: formData.email,
      address: {
        street: formData.street,
        number: formData.number,
        district: formData.district,
        city: formData.city,
        zipCode: formData.zipCode
      },
      totalPurchases: editingCustomer?.totalPurchases || 0,
      isActive: true,
      customerType: 'residential' as const
    };

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, customerData);
    } else {
      addCustomer(customerData);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteCustomer(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h1>
        <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{customer.name}</h3>
                    <p className="text-gray-500 mt-1">{customer.document}</p>
                    <p className="text-sm text-gray-500 mt-1 capitalize">
                      {customer.customerType === 'residential' ? 'Residencial' : 'Comercial'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenModal(customer)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(customer.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="font-medium">{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center text-gray-600">
                    <span className="w-4 h-4 mr-2 text-center">@</span>
                    <span className="font-medium break-all">{customer.email}</span>
                  </div>
                )}
                <div className="flex items-start text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <div className="flex-1">
                    <p className="font-medium leading-tight">
                      {customer.address.street}, {customer.address.number}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {customer.address.district}, {customer.address.city}
                    </p>
                    <p className="text-sm text-gray-500">
                      CEP: {customer.address.zipCode}
                    </p>
                    {customer.address.complement && (
                      <p className="text-sm text-gray-500 mt-1">
                        Complemento: {customer.address.complement}
                      </p>
                    )}
                    {customer.address.reference && (
                      <p className="text-sm text-gray-500 mt-1">
                        Referência: {customer.address.reference}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 block">Total de Compras:</span>
                      <span className="font-bold text-green-600 text-lg">
                        R$ {customer.totalPurchases.toFixed(2)}
                      </span>
                    </div>
                    {customer.creditLimit && (
                      <div>
                        <span className="text-gray-500 block">Limite de Crédito:</span>
                        <span className="font-semibold text-blue-600 text-lg">
                          R$ {customer.creditLimit.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    ID: <span className="font-mono text-xs">#{customer.id.slice(-8)}</span>
                  </p>
                  {customer.lastPurchase && (
                    <p className="text-sm text-gray-500 mt-1">
                      Última compra: {new Date(customer.lastPurchase).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  {customer.notes && (
                    <div className="mt-2">
                      <span className="text-gray-500 text-sm block">Observações:</span>
                      <p className="text-sm text-gray-900 mt-1 leading-relaxed">{customer.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum cliente encontrado</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input
              label="CPF/CNPJ"
              value={formData.document}
              onChange={(e) => setFormData({...formData, document: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Endereço</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Logradouro"
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                  required
                />
              </div>
              <Input
                label="Número"
                value={formData.number}
                onChange={(e) => setFormData({...formData, number: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Bairro"
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
                required
              />
              <Input
                label="Cidade"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                required
              />
              <Input
                label="CEP"
                value={formData.zipCode}
                onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingCustomer ? 'Atualizar' : 'Adicionar'} Cliente
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomersPage;