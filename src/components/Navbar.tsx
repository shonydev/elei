import React, { useState, useRef, useEffect } from 'react';
import { CATEGORIES } from '../data/initialBusinesses';
import { BusinessCategory } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { User } from '../services/firebase';
import {
  Search,
  Plus,
  Map,
  ChevronDown,
  X,
  FileSpreadsheet,
  MapPin,
  Shield,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  selectedCategory: BusinessCategory | 'all';
  onSelectCategory: (cat: BusinessCategory | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: 'map' | 'list';
  onToggleViewMode: () => void;
  onOpenAddModal: () => void;
  businessCount: number;
  onExportCSV?: () => void;
  isAdmin: boolean;
  currentUser: User | null;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  viewMode,
  onToggleViewMode,
  onOpenAddModal,
  businessCount,
  onExportCSV,
  isAdmin,
  currentUser,
  onOpenAdminLogin,
  onAdminLogout,
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  return (
    <div className="absolute top-3 inset-x-3 sm:inset-x-6 z-[1200] pointer-events-none flex flex-col gap-2 max-w-4xl mx-auto">
      {/* Top Floating Row */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* View Mode Toggle Button */}
        <button
          onClick={onToggleViewMode}
          className="w-11 h-11 rounded-full bg-white shadow-xl border border-black/5 flex items-center justify-center text-black hover:bg-stone-50 active:scale-95 transition shrink-0"
          title={viewMode === 'map' ? 'Ver en lista' : 'Ver en mapa'}
        >
          {viewMode === 'map' ? (
            <ChevronDown className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <Map className="w-5 h-5 stroke-[2.2]" />
          )}
        </button>

        {/* Uber-style Search Pill: Shows "Los Ángeles" and the magnifying glass 🔍 */}
        {!isSearchExpanded && !searchQuery ? (
          <button
            type="button"
            onClick={() => setIsSearchExpanded(true)}
            className="flex-1 h-11 flex items-center justify-between bg-white rounded-full shadow-xl border border-black/5 px-4 py-2 transition active:scale-[0.99] text-left hover:bg-stone-50"
            title="Buscar cafeterías y lugares en Los Ángeles"
          >
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-black shrink-0" />
              <span className="text-xs sm:text-sm font-black text-black tracking-tight truncate">
                Los Ángeles
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-800 shrink-0 ml-2">
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </button>
        ) : !isSearchExpanded && searchQuery ? (
          <div className="flex-1 h-11 flex items-center justify-between bg-white rounded-full shadow-xl border border-black/10 px-4 py-2">
            <button
              type="button"
              onClick={() => setIsSearchExpanded(true)}
              className="flex items-center gap-2 min-w-0 text-left"
            >
              <Search className="w-4 h-4 text-black shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-black truncate">
                "{searchQuery}"
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                setIsSearchExpanded(false);
              }}
              className="p-1 text-stone-400 hover:text-black transition"
              title="Borrar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1 h-11 flex items-center bg-white rounded-full shadow-2xl border-2 border-black px-3.5 py-2 transition">
            <Search className="w-4 h-4 text-stone-400 shrink-0 mr-2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar cafeterías, calles o lugares..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full text-xs sm:text-sm font-semibold text-black placeholder:text-stone-400 focus:outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 text-stone-400 hover:text-black mr-1"
                title="Limpiar texto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSearchExpanded(false)}
              className="text-xs font-bold text-black bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded-full transition shrink-0 ml-1"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Top Actions: Export CSV, PWA Install & Admin Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* CSV Export (Admin only) */}
          {isAdmin && onExportCSV && (
            <button
              onClick={onExportCSV}
              className="w-11 h-11 rounded-full bg-white hover:bg-stone-50 text-black border border-black/5 shadow-xl flex items-center justify-center active:scale-95 transition"
              title="Exportar todas las cafeterías a un archivo .CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </button>
          )}

          <PWAInstallButton variant="header" />

          {/* Admin Login / Logout button */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onAdminLogout}
                className="h-11 px-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xl flex items-center gap-1.5 active:scale-95 transition"
                title={`Admin conectado (${currentUser?.email || 'Admin'}). Clic para cerrar sesión`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
                <LogOut className="w-3.5 h-3.5 ml-0.5 opacity-80" />
              </button>

              <button
                onClick={onOpenAddModal}
                className="h-11 px-3.5 sm:px-4 rounded-full bg-black hover:bg-stone-800 text-white text-xs sm:text-sm font-bold shadow-xl flex items-center gap-1.5 active:scale-95 transition"
                title="Agregar nueva cafetería (Modo Administrador)"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden xs:inline">Agregar</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="h-11 px-3 sm:px-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-700 hover:text-black border border-black/5 shadow-xl flex items-center gap-1.5 active:scale-95 transition text-xs font-bold"
              title="Acceso Administrador"
            >
              <Shield className="w-4 h-4 text-stone-500" />
              <span className="hidden md:inline">Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto py-1">
        <button
          onClick={() => onSelectCategory('all')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-md active:scale-95 ${
            selectedCategory === 'all'
              ? 'bg-black text-white'
              : 'bg-white text-black border border-black/10 hover:bg-stone-100'
          }`}
        >
          ☕ Todos ({businessCount})
        </button>

        {Object.values(CATEGORIES).map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition shadow-md active:scale-95 ${
                isActive
                  ? 'bg-black text-white'
                  : 'bg-white text-black border border-black/10 hover:bg-stone-100'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
