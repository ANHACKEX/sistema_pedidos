import React, { useState } from 'react';
import { Plus, Search, User, Shield, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { User as UserType } from '../types';

const UsersPage: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'seller' as 'admin' | 'seller' | 'delivery' | 'financial',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    isActive: true,
    permissions: [] as string[]
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenModal = (user?: UserType) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
        confirmPassword: '',
        phone: user.phone || '',
        address: user.address || '',
        isActive: user.isActive,
        permissions: user.permissions || []
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'seller',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
        isActive: true,
        permissions: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar senhas se for novo usuário
    if (!editingUser) {
      if (formData.password !== formData.confirmPassword) {
        const event = new CustomEvent('showToast', {
          detail: { type: 'error', message: 'As senhas não coincidem!' }
        });
        window.dispatchEvent(event);
        return;
      }
      
      if (formData.password.length < 6) {
        const event = new CustomEvent('showToast', {
          detail: { type: 'error', message: 'A senha deve ter pelo menos 6 caracteres!' }
        });
        window.dispatchEvent(event);
        return;
      }
    }
    
    const userData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      phone: formData.phone,
      address: formData.address,
      isActive: formData.isActive,
      permissions: getDefaultPermissions(formData.role),
      lastLogin: editingUser?.lastLogin,
      password: formData.password || undefined
    };

    if (editingUser) {
      updateUser(editingUser.id, userData);
    } else {
      addUser(userData);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      deleteUser(id);
    }
  };

  const toggleUserStatus = (user: UserType) => {
    updateUser(user.id, { isActive: !user.isActive });
  };

  const getDefaultPermissions = (role: string): string[] => {
    switch (role) {
      case 'admin':
        return ['all'];
      case 'seller':
        return ['sales', 'customers', 'products'];
      case 'delivery':
        return ['deliveries', 'customers'];
      case 'financial':
        return ['financial', 'reports'];
      default:
        return [];
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'seller': return 'bg-blue-100 text-blue-800';
      case 'delivery': return 'bg-green-100 text-green-800';
      case 'financial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'seller': return 'Vendedor';
      case 'delivery': return 'Entregador';
      case 'financial': return 'Financeiro';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-600 mt-1">Controle de acesso e permissões</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          <p className="text-sm text-gray-600">Total de Usuários</p>
        </Card>
        
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <Eye className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {users.filter(u => u.isActive).length}
          </p>
          <p className="text-sm text-gray-600">Usuários Ativos</p>
        </Card>
        
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {users.filter(u => u.role === 'admin').length}
          </p>
          <p className="text-sm text-gray-600">Administradores</p>
        </Card>
        
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3">
            <User className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {users.filter(u => u.role === 'seller').length}
          </p>
          <p className="text-sm text-gray-600">Vendedores</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os cargos</option>
              <option value="admin">Administrador</option>
              <option value="seller">Vendedor</option>
              <option value="delivery">Entregador</option>
              <option value="financial">Financeiro</option>
            </select>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                    {getRoleText(user.role)}
                  </span>
                  <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {user.phone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Telefone:</span>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                )}
                {user.lastLogin && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Último acesso:</span>
                    <span className="font-medium">{new Date(user.lastLogin).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenModal(user)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <Button 
                  size="sm" 
                  variant={user.isActive ? "outline" : "success"}
                  onClick={() => toggleUserStatus(user)}
                >
                  {user.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-600">Usuário</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Cargo</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Contato</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Último Acesso</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleText(user.role)}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-gray-600">
                    {user.phone || '-'}
                  </td>
                  <td className="py-4 px-2 text-gray-600">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`text-sm font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenModal(user)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant={user.isActive ? "outline" : "success"}
                        onClick={() => toggleUserStatus(user)}
                      >
                        {user.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </Card>

      {/* User Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="seller">Vendedor</option>
                <option value="delivery">Entregador</option>
                <option value="financial">Financeiro</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <Input
              label="Telefone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          {!editingUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Senha"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={!editingUser}
                placeholder="Mínimo 6 caracteres"
              />
              <Input
                label="Confirmar Senha"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required={!editingUser}
                placeholder="Confirme a senha"
              />
            </div>
          )}

          <Input
            label="Endereço"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Usuário ativo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingUser ? 'Atualizar' : 'Criar'} Usuário
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;