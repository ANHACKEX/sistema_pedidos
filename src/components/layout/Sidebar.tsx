import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  DollarSign,
  Settings,
  ShoppingCart,
  TrendingUp,
  UserCog,
  Truck,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'seller', 'delivery', 'financial'] },
    { path: '/products', icon: Package, label: 'Estoque', roles: ['admin', 'seller'] },
    { path: '/customers', icon: Users, label: 'Clientes', roles: ['admin', 'seller', 'delivery'] },
    { path: '/sales', icon: ShoppingCart, label: 'Vendas', roles: ['admin', 'seller'] },
    { path: '/deliveries', icon: Truck, label: 'Entregas', roles: ['admin', 'delivery', 'seller'] },
    { path: '/financial', icon: DollarSign, label: 'Financeiro', roles: ['admin', 'financial'] },
    { path: '/reports', icon: TrendingUp, label: 'Relatórios', roles: ['admin', 'financial'] },
    { path: '/users', icon: UserCog, label: 'Usuários', roles: ['admin'] },
    { path: '/settings', icon: Settings, label: 'Configurações', roles: ['admin'] },
  ];

  const hasAccess = (roles: string[]) => {
    return user && roles.includes(user.role);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G+</span>
            </div>
            <span className="font-bold text-gray-900">Gas Gestão+</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-8 lg:mt-8 flex flex-col h-full">
          <div className="px-4 space-y-2 flex-1">
            {menuItems.map((item) => {
              if (!hasAccess(item.roles)) return null;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;