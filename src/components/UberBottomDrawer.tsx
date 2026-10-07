import React from 'react';
import { Business } from '../types';
import { CATEGORIES } from '../data/initialBusinesses';
import {
  Star,
  Navigation,
  MessageCircle,
  Instagram,
  Share2,
  Trash2,
  Move,
  Plus,
  FileSpreadsheet,
  X,
  ExternalLink,
} from 'lucide-react';

interface UberBottomDrawerProps {
  businesses: Business[];
  selectedBusiness: Business | null;
  onSelectBusiness: (business: Business) => void;
  onClearSelection: () => void;
  onOpenAddModal: () => void;
  onRequestDelete: (business: Business) => void;
  onStartRelocation: (business: Business) => void;
  onShowToast?: (msg: string) => void;
  onExportCSV?: () => void;
  isAdmin: boolean;
}

export const UberBottomDrawer: React.FC<UberBottomDrawerProps> = ({
  businesses,
  selectedBusiness,
  onSelectBusiness,
  onClearSelection,
  onOpenAddModal,
  onRequestDelete,
  onStartRelocation,
  onShowToast,
  onExportCSV,
  isAdmin,
}) => {
  const businessCount = businesses.length;

  // Selected Business Bottom Card (Clean Uber Sheet style)
  if (selectedBusiness) {
    const cat = CATEGORIES[selectedBusiness.category] || CATEGORIES.cafeteria;
    const cleanPhone = selectedBusiness.whatsapp || selectedBusiness.phone?.replace(/[^0-9]/g, '');

    const handleShare = () => {
      if (navigator.share) {
        navigator.share({
          title: selectedBusiness.name,
          text: `Te recomiendo ${selectedBusiness.name} en Los Ángeles, Chile. Ubicado en ${selectedBusiness.address}`,
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(`${selectedBusiness.name} - ${selectedBusiness.address}`);
        if (onShowToast) onShowToast('Información copiada al portapapeles');
      }
    };

    return (
      <div className="absolute inset-x-0 bottom-0 z-[1250] pointer-events-auto max-w-lg mx-auto animate-in slide-in-from-bottom duration-200">
        <div className="bg-white rounded-t-3xl shadow-2xl border-t border-black/10 px-5 pt-3 pb-6 text-black">
          {/* Top Drag Handle */}
          <div className="w-10 h-1 rounded-full bg-stone-300 mx-auto mb-3" />

          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              {/* Circular Avatar */}
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-2 border-black overflow-hidden shadow-md bg-stone-100">
                  <img
                    src={selectedBusiness.imageUrl}
                    alt={selectedBusiness.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center border border-white">
                  {cat.emoji}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-black leading-tight">
                  {selectedBusiness.name}
                </h3>
                <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5 font-medium">
                  <span>{cat.label}</span>
                  <span>•</span>
                  <span className="font-mono text-black font-bold">{selectedBusiness.priceLevel}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-black font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    {selectedBusiness.rating.toFixed(1)}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={onClearSelection}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition shrink-0"
              title="Cerrar ficha"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Business Info: Address & Hours */}
          <div className="space-y-1 mb-4 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            <p className="truncate font-medium flex items-center gap-1.5 text-stone-800">
              <span className="text-stone-400">📍</span>
              <span>{selectedBusiness.address}</span>
            </p>
            {selectedBusiness.openingHours && (
              <p className="text-stone-500 font-medium flex items-center gap-1.5">
                <span className="text-stone-400">🕒</span>
                <span>{selectedBusiness.openingHours}</span>
              </p>
            )}
          </div>

          {/* Action Buttons: "Cómo llegar" (Full-width black button like Uber "Confirmar") */}
          <div className="space-y-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedBusiness.lat},${selectedBusiness.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-black hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99]"
            >
              <Navigation className="w-4 h-4 fill-current" />
              <span>Cómo llegar (Ruta en mapa)</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              {cleanPhone ? (
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              ) : (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedBusiness.address);
                    if (onShowToast) onShowToast('Dirección copiada al portapapeles');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>Copiar Dirección</span>
                </button>
              )}

              {selectedBusiness.instagram ? (
                <a
                  href={`https://instagram.com/${selectedBusiness.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  <span>Instagram</span>
                </a>
              ) : (
                <button
                  onClick={handleShare}
                  className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartir</span>
                </button>
              )}
            </div>

            {/* Bottom Actions Row: Relocate & Delete (ADMIN ONLY) */}
            {isAdmin && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 mt-1">
                <button
                  type="button"
                  onClick={() => onStartRelocation(selectedBusiness)}
                  className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Move className="w-3.5 h-3.5 text-blue-600" />
                  <span>Reubicar en mapa</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRequestDelete(selectedBusiness)}
                  className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar cafetería</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default Bottom Bar (like "Inicio de viaje en 6 min" in Uber screenshot)
  return (
    <div className="absolute inset-x-0 bottom-0 z-[1250] pointer-events-auto max-w-lg mx-auto">
      <div className="bg-white rounded-t-3xl shadow-2xl border-t border-black/10 px-5 pt-3 pb-5 text-black">
        {/* Top Drag Handle */}
        <div className="w-10 h-1 rounded-full bg-stone-300 mx-auto mb-3" />

        {/* Uber Status Title */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-black tracking-tight">
              Cafés en Los Ángeles
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {businessCount} cafeterías y comercios disponibles cerca
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onExportCSV && (
              <button
                type="button"
                onClick={onExportCSV}
                className="px-3.5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 border border-stone-200/70"
                title="Exportar todas las cafeterías a un archivo .CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden xs:inline">Exportar CSV</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2.5 rounded-full bg-black hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Agregar</span>
              </button>
            )}
          </div>
        </div>

        {/* Circular Coffee Avatars List (Quick Selector) */}
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
          {businesses.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelectBusiness(b)}
              className="group flex flex-col items-center gap-1 shrink-0 active:scale-95 transition"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-black/80 overflow-hidden shadow-xs bg-stone-100 group-hover:scale-105 group-hover:border-black transition">
                  <img
                    src={b.imageUrl}
                    alt={b.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <span className="text-[11px] font-bold text-black max-w-[56px] truncate text-center">
                {b.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
