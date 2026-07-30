import React, { useState } from 'react';
import { Pet, UserProfile } from '../types';
import { ShoppingBag, ChevronDown, CheckCircle2, ShieldCheck, LogIn, LogOut, Users, Scan } from 'lucide-react';
import { ADMIN_EMAIL } from '../lib/firebase';

interface HeaderProps {
  userProfile: UserProfile;
  activePet: Pet;
  onSelectPet: (petId: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onNavigateTab: (tab: string) => void;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  isAdmin: boolean;
  activeTab: string;
  onOpenScanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  activePet,
  onSelectPet,
  cartCount,
  onOpenCart,
  onNavigateTab,
  onGoogleSignIn,
  onGoogleSignOut,
  isAdmin,
  activeTab,
  onOpenScanner,
}) => {
  const [isPetDropdownOpen, setIsPetDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-emerald-100/60 px-3 sm:px-4 py-2.5 shadow-xs transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center space-x-2.5 cursor-pointer group"
          onClick={() => onNavigateTab('feed')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 via-teal-300 to-rose-300 p-0.5 shadow-xs group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-emerald-300 font-bold text-lg">
              🐾
            </div>
          </div>
          <div>
            <span className="font-serif-title font-bold text-lg sm:text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
              Pet Family
              {isAdmin ? (
                <span className="text-[10px] font-sans font-bold bg-slate-900 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Admin
                </span>
              ) : (
                <span className="text-[10px] font-sans font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Máx 30
                </span>
              )}
            </span>
            <p className="text-[10px] text-slate-500 font-medium -mt-1 hidden sm:block">
              Rede Social Exclusiva para Pets & Boutique
            </p>
          </div>
        </div>

        {/* Right Section: Scanner, Pet Switcher, Admin Button, Google Auth & Cart */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          
          {/* AI Breed Scanner Trigger Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center space-x-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full shadow-xs hover:scale-105 active:scale-95 transition-all border border-emerald-400/40"
            title="Escanear Cão ou Gato com IA para identificar Raça e Medidas"
          >
            <Scan className="w-3.5 h-3.5 text-emerald-200" />
            <span className="text-[11px]">Scanner IA</span>
          </button>

          {/* Admin Navigation Button (If user is pedrobzg@gmail.com) */}
          {isAdmin && (
            <button
              onClick={() => onNavigateTab('admin')}
              className={`flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-full font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-emerald-300 ring-2 ring-emerald-400/50 shadow-sm'
                  : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Painel Admin</span>
            </button>
          )}

          {/* Active Pet Selector */}
          <div className="relative">
            <button
              onClick={() => setIsPetDropdownOpen(!isPetDropdownOpen)}
              className="flex items-center space-x-1.5 bg-white/80 hover:bg-white border border-emerald-200/80 rounded-full pl-1.5 pr-2 py-1 shadow-2xs text-xs font-medium text-slate-700 transition-all hover:border-emerald-400"
              title="Alternar Pet Ativo"
            >
              <img
                src={activePet?.avatarUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'}
                alt={activePet?.name || 'Pet'}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-emerald-300"
              />
              <span className="font-semibold text-slate-800 max-w-[50px] sm:max-w-[100px] truncate text-[11px] sm:text-xs">
                {activePet?.name || 'Meu Pet'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isPetDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {isPetDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Os teus Pets ({userProfile.pets.length})
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {userProfile.pets.map((pet) => (
                    <button
                      key={pet.id}
                      onClick={() => {
                        onSelectPet(pet.id);
                        setIsPetDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors ${
                        pet.id === activePet?.id ? 'bg-emerald-50/70 text-emerald-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={pet.avatarUrl}
                          alt={pet.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-medium text-slate-800">{pet.name}</div>
                          <div className="text-[10px] text-slate-400">{pet.breed} • {pet.weightKg}kg</div>
                        </div>
                      </div>
                      {pet.id === activePet?.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsPetDropdownOpen(false);
                      onNavigateTab('profile');
                    }}
                    className="w-full text-center text-xs text-emerald-700 font-medium py-1 hover:underline flex items-center justify-center gap-1"
                  >
                    <span>+ Gerir & Medir Pets</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Google Auth Button */}
          {userProfile.isGoogleAuthenticated ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onGoogleSignOut();
              }}
              className="flex items-center space-x-1.5 text-xs bg-emerald-50 hover:bg-rose-50 text-emerald-900 hover:text-rose-800 border border-emerald-200 hover:border-rose-200 px-2 py-1 rounded-full transition-all group"
              title={`Sair de ${userProfile.email}`}
            >
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="font-semibold text-[11px] hidden sm:inline truncate max-w-[80px]">
                {userProfile.name.split(' ')[0]}
              </span>
              <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 shrink-0" />
            </button>
          ) : (
            <button
              onClick={onGoogleSignIn}
              className="flex items-center space-x-1 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold px-2.5 py-1.5 rounded-full transition-all shadow-2xs hover:scale-105 active:scale-95"
              title="Entrar com a conta Google"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-[11px] hidden sm:inline">Google</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-full bg-slate-900 text-slate-100 hover:bg-slate-800 transition-all shadow-2xs hover:scale-105 active:scale-95 shrink-0"
            aria-label="Abrir Carrinho"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-2xs">
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
};


