import React, { useState } from 'react';
import { Save, Building, Bell, Smartphone, CreditCard, Shield, Palette, Globe, Download, Upload, Trash2, User, Camera, Eye, EyeOff, Settings } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { StorageManager } from '../utils/storage';

const SettingsPage: React.FC = () => {
  const { company, settings, updateCompany, updateSettings, users, updateUser } = useData();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('company');
  const [companyData, setCompanyData] = useState(company);
  const [settingsData, setSettingsData] = useState(settings);
  const [userProfile, setUserProfile] = useState(user || {});
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const storageManager = StorageManager.getInstance();

  const handleSaveCompany = () => {
    updateCompany(companyData);
    // Show success feedback
    const event = new CustomEvent('showToast', {
      detail: { type: 'success', message: 'Dados da empresa salvos com sucesso!' }
    });
    window.dispatchEvent(event);
  };

  const handleSaveSettings = () => {
    updateSettings(settingsData);
    const event = new CustomEvent('showToast', {
      detail: { type: 'success', message: 'Configurações salvas com sucesso!' }
    });
    window.dispatchEvent(event);
  };

  const exportData = () => {
    const data = storageManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gas-gestao-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = storageManager.importData(content);
      if (success) {
        const event = new CustomEvent('showToast', {
          detail: { type: 'success', message: 'Dados importados com sucesso! Recarregue a página.' }
        });
        window.dispatchEvent(event);
      } else {
        const event = new CustomEvent('showToast', {
          detail: { type: 'error', message: 'Erro ao importar dados. Verifique o arquivo.' }
        });
        window.dispatchEvent(event);
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    storageManager.clearAllData();
    const event = new CustomEvent('showToast', {
      detail: { type: 'success', message: 'Todos os dados foram removidos! Recarregue a página.' }
    });
    window.dispatchEvent(event);
  };
  const tabs = [
    { id: 'company', name: 'Empresa', icon: Building },
    { id: 'profile', name: 'Meu Perfil', icon: User },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'integrations', name: 'Integrações', icon: Smartphone },
    { id: 'features', name: 'Recursos', icon: Shield },
    { id: 'system', name: 'Sistema', icon: Settings },
    { id: 'backup', name: 'Backup', icon: Download }
  ];

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setCompanyData({...companyData, logo: logoUrl});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatarUrl = e.target?.result as string;
        setUserProfile({...userProfile, avatar: avatarUrl});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (user) {
      updateUser(user.id, userProfile);
      const event = new CustomEvent('showToast', {
        detail: { type: 'success', message: 'Perfil atualizado com sucesso!' }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="space-y-6 min-h-screen bg-gray-50">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Sidebar */}
        <div className="xl:w-80">
          <Card padding={false}>
            <nav className="space-y-1 p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'company' && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Dados da Empresa</h2>
                <Button onClick={handleSaveCompany}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome da Empresa"
                    value={companyData.name}
                    onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  />
                  <Input
                    label="CNPJ"
                    value={companyData.document}
                    onChange={(e) => setCompanyData({...companyData, document: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Telefone"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={companyData.email}
                    onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-4">Logo da Empresa</h3>
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                      {companyData.logo ? (
                        <img src={companyData.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Building className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Logo da Empresa</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload">
                        <Button variant="outline" as="span">
                          <Camera className="w-4 h-4 mr-2" />
                          Alterar Logo
                        </Button>
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        Formatos aceitos: PNG, JPG, GIF<br/>
                        Tamanho máximo: 2MB<br/>
                        Recomendado: 400x400px
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-4">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        label="Logradouro"
                        value={companyData.address.street}
                        onChange={(e) => setCompanyData({
                          ...companyData,
                          address: {...companyData.address, street: e.target.value}
                        })}
                      />
                    </div>
                    <Input
                      label="Número"
                      value={companyData.address.number}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        address: {...companyData.address, number: e.target.value}
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <Input
                      label="Bairro"
                      value={companyData.address.district}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        address: {...companyData.address, district: e.target.value}
                      })}
                    />
                    <Input
                      label="Cidade"
                      value={companyData.address.city}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        address: {...companyData.address, city: e.target.value}
                      })}
                    />
                    <Input
                      label="CEP"
                      value={companyData.address.zipCode}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        address: {...companyData.address, zipCode: e.target.value}
                      })}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-4">Configurações de Entrega</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Raio de Entrega (km)"
                      type="number"
                      value={companyData.deliveryRadius}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        deliveryRadius: parseInt(e.target.value)
                      })}
                    />
                    <Input
                      label="Valor Mínimo para Entrega (R$)"
                      type="number"
                      step="0.01"
                      value={companyData.minimumDeliveryValue}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        minimumDeliveryValue: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-4">Redes Sociais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="WhatsApp"
                      value={companyData.socialMedia?.whatsapp || ''}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        socialMedia: {
                          ...companyData.socialMedia,
                          whatsapp: e.target.value
                        }
                      })}
                      placeholder="(11) 99999-9999"
                    />
                    <Input
                      label="Instagram"
                      value={companyData.socialMedia?.instagram || ''}
                      onChange={(e) => setCompanyData({
                        ...companyData,
                        socialMedia: {
                          ...companyData.socialMedia,
                          instagram: e.target.value
                        }
                      })}
                      placeholder="@empresa"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'profile' && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Meu Perfil</h2>
                <Button onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-4">Foto do Perfil</h3>
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                      {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label htmlFor="avatar-upload">
                        <Button variant="outline" as="span">
                          <Camera className="w-4 h-4 mr-2" />
                          Alterar Foto
                        </Button>
                      </label>
                      <p className="text-sm text-gray-500 mt-2">PNG, JPG até 2MB<br/>Recomendado: 200x200px</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome Completo"
                    value={userProfile.name || ''}
                    onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={userProfile.email || ''}
                    onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Telefone"
                    value={userProfile.phone || ''}
                    onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 capitalize">
                      {userProfile.role === 'admin' ? 'Administrador' :
                       userProfile.role === 'seller' ? 'Vendedor' :
                       userProfile.role === 'delivery' ? 'Entregador' : 'Financeiro'}
                    </div>
                  </div>
                </div>

                <Input
                  label="Endereço"
                  value={userProfile.address || ''}
                  onChange={(e) => setUserProfile({...userProfile, address: e.target.value})}
                />

                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-4">Alterar Senha</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Input
                        label="Nova Senha"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite a nova senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Input
                      label="Confirmar Senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">Informações da Conta</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Último acesso:</span>
                      <span className="font-medium text-blue-900">
                        {userProfile.lastLogin ? new Date(userProfile.lastLogin).toLocaleString('pt-BR') : 'Nunca'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Status:</span>
                      <span className={`font-medium ${userProfile.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {userProfile.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Notificações</h2>
                <Button onClick={handleSaveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Notificações por Email</h3>
                      <p className="text-gray-600">Receber notificações importantes por email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsData.notifications.email}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          notifications: {
                            ...settingsData.notifications,
                            email: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Notificações por SMS</h3>
                      <p className="text-gray-600">Receber alertas importantes por SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsData.notifications.sms}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          notifications: {
                            ...settingsData.notifications,
                            sms: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Notificações por WhatsApp</h3>
                      <p className="text-gray-600">Receber notificações via WhatsApp</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsData.notifications.whatsapp}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          notifications: {
                            ...settingsData.notifications,
                            whatsapp: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Integrações</h2>
                <Button onClick={handleSaveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">WhatsApp API</h3>
                        <p className="text-sm text-gray-600">Integração para envio automático de mensagens</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsData.integrations.whatsappApi?.enabled || false}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          integrations: {
                            ...settingsData.integrations,
                            whatsappApi: {
                              ...settingsData.integrations.whatsappApi,
                              enabled: e.target.checked
                            }
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {settingsData.integrations.whatsappApi?.enabled && (
                    <div className="space-y-4">
                      <Input
                        label="Token da API"
                        value={settingsData.integrations.whatsappApi?.token || ''}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          integrations: {
                            ...settingsData.integrations,
                            whatsappApi: {
                              ...settingsData.integrations.whatsappApi,
                              token: e.target.value
                            }
                          }
                        })}
                        placeholder="Insira o token da API do WhatsApp"
                      />
                      <Input
                        label="Número do WhatsApp"
                        value={settingsData.integrations.whatsappApi?.phoneNumber || ''}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          integrations: {
                            ...settingsData.integrations,
                            whatsappApi: {
                              ...settingsData.integrations.whatsappApi,
                              phoneNumber: e.target.value
                            }
                          }
                        })}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Gateway de Pagamento</h3>
                        <p className="text-sm text-gray-600">Integração para processamento de pagamentos</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsData.integrations.paymentGateway?.enabled || false}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          integrations: {
                            ...settingsData.integrations,
                            paymentGateway: {
                              ...settingsData.integrations.paymentGateway,
                              enabled: e.target.checked
                            }
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {settingsData.integrations.paymentGateway?.enabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Provedor</label>
                        <select
                          value={settingsData.integrations.paymentGateway?.provider || ''}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            integrations: {
                              ...settingsData.integrations,
                              paymentGateway: {
                                ...settingsData.integrations.paymentGateway,
                                provider: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Selecione um provedor</option>
                          <option value="stripe">Stripe</option>
                          <option value="mercadopago">Mercado Pago</option>
                          <option value="pagseguro">PagSeguro</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'features' && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Recursos do Sistema</h2>
                <Button onClick={handleSaveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Módulo de Entregas</h3>
                    <p className="text-gray-600">Ativar sistema de controle de entregas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsData.features.deliveryModule}
                      onChange={(e) => setSettingsData({
                        ...settingsData,
                        features: {
                          ...settingsData.features,
                          deliveryModule: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Geração de Notas Fiscais</h3>
                    <p className="text-gray-600">Ativar emissão automática de notas fiscais</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsData.features.invoiceGeneration}
                      onChange={(e) => setSettingsData({
                        ...settingsData,
                        features: {
                          ...settingsData.features,
                          invoiceGeneration: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Múltiplas Formas de Pagamento</h3>
                    <p className="text-gray-600">Permitir diferentes métodos de pagamento</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsData.features.multiplePaymentMethods}
                      onChange={(e) => setSettingsData({
                        ...settingsData,
                        features: {
                          ...settingsData.features,
                          multiplePaymentMethods: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Portal do Cliente</h3>
                    <p className="text-gray-600">Permitir que clientes acessem seus dados</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsData.features.customerPortal}
                      onChange={(e) => setSettingsData({
                        ...settingsData,
                        features: {
                          ...settingsData.features,
                          customerPortal: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Configurações do Sistema</h2>
                <Button onClick={handleSaveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">Informações do Sistema</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 block font-medium">Versão:</span>
                      <span className="text-blue-900">Gas Gestão+ v2.0.0</span>
                    </div>
                    <div>
                      <span className="text-blue-700 block font-medium">Última Atualização:</span>
                      <span className="text-blue-900">{new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-blue-700 block font-medium">Licença:</span>
                      <span className="text-blue-900">Comercial</span>
                    </div>
                    <div>
                      <span className="text-blue-700 block font-medium">Suporte:</span>
                      <span className="text-blue-900">Ativo</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Modo de Produção</h3>
                      <p className="text-gray-600">Sistema configurado para ambiente de produção</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Ativo
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Backup Automático</h3>
                      <p className="text-gray-600">Backup diário dos dados do sistema</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={true}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Logs do Sistema</h3>
                      <p className="text-gray-600">Registrar atividades do sistema</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={true}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'backup' && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Backup e Restauração</h2>
              </div>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-medium text-gray-900 mb-4">Exportar Dados</h3>
                  <p className="text-gray-600 mb-4">
                    Faça backup de todos os dados do sistema em um arquivo JSON.
                  </p>
                  <Button onClick={exportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Backup
                  </Button>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-medium text-gray-900 mb-4">Importar Dados</h3>
                  <p className="text-gray-600 mb-4">
                    Restaure dados de um arquivo de backup. Isso substituirá todos os dados atuais.
                  </p>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      className="hidden"
                      id="import-file"
                    />
                    <label htmlFor="import-file">
                      <Button variant="outline" as="span">
                        <Upload className="w-4 h-4 mr-2" />
                        Selecionar Arquivo
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                  <h3 className="text-xl font-medium text-red-900 mb-4">Zona de Perigo</h3>
                  <p className="text-red-700 mb-4">
                    Esta ação removerá permanentemente todos os dados do sistema.
                  </p>
                  <Button 
                    variant="danger" 
                    onClick={() => setConfirmDialog({ isOpen: true, type: 'clear' })}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Todos os Dados
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: '' })}
        onConfirm={clearAllData}
        title="Limpar Todos os Dados"
        message="Esta ação removerá permanentemente todos os dados do sistema. Esta ação não pode ser desfeita."
        confirmText="Limpar Dados"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default SettingsPage;
