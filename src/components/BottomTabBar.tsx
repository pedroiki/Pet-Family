import React from 'react';
import { Camera, ShoppingBag, Radio, MessageSquare, Dog, ShieldCheck } from 'lucide-react';

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadMessagesCount?: number;
  isAdmin?: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  unreadMessagesCount = 1,
  isAdmin = false,
}) => {
  const navItems = [
    {
      id: 'feed',
      label: 'Feed #NoHumans',
      icon: Camera,
      badge: 'Genuíno',
    },
    {
      id: 'boutique',
      label: 'Boutique',
      icon: ShoppingBag,
      badge: 'Medidas',
    },
    {
      id: 'radar',
      label: 'Radar GPS',
      icon: Radio,
      badge: '25km',
    },
    {
      id: 'messages',
      label: 'Mensagens',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount}` : null,
    },
    {
      id: 'profile',
      label: 'Perfil Pet',
      icon: Dog,
      badge: null,
    },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Painel Admin',
      icon: ShieldCheck,
      badge: '30 máx',
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative group ${
                isActive
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <div className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-100 text-emerald-900 scale-110 shadow-2xs' : 'group-hover:bg-slate-100'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                {item.badge && item.id === 'messages' && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight font-medium ${
                isActive ? 'text-slate-900 font-bold' : 'text-slate-500'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-emerald-500 rounded-full mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

