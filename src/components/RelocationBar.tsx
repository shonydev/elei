import React from 'react';
import { Business } from '../types';
import { MapPin, Check, X, Navigation } from 'lucide-react';

interface RelocationBarProps {
  business: Business;
  coordinates: { lat: number; lng: number };
  onConfirm: () => void;
  onCancel: () => void;
  onSnapToBulnes?: () => void;
}

export const RelocationBar: React.FC<RelocationBarProps> = ({
  business,
  coordinates,
  onConfirm,
  onCancel,
  onSnapToBulnes,
}) => {
  return (
    <div className="absolute bottom-5 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] z-[2000] pointer-events-auto animate-in slide-in-from-bottom duration-200">
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-black/10 text-black">
        {/* Top Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden shadow-sm">
              <img
                src={business.imageUrl}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] border border-white">
              📍
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black text-white">
                Reubicando
              </span>
            </div>
            <h3 className="text-sm font-black text-black truncate mt-0.5">
              {business.name}
            </h3>
            <p className="text-[11px] text-stone-500 truncate">
              {business.address}
            </p>
          </div>
        </div>

        {/* Tip Banner */}
        <div className="bg-stone-50 rounded-2xl p-2.5 mb-2.5 border border-stone-200/80 flex items-center gap-2 text-xs text-stone-700">
          <MapPin className="w-4 h-4 text-black shrink-0 animate-bounce" />
          <span className="text-[11px] leading-tight">
            <strong>Toca en Calle Bulnes</strong> o arrastra el marcador para fijar la posición (las colisiones y cercanía están 100% permitidas).
          </span>
        </div>

        {/* Snap to Bulnes Shortcut Button */}
        {onSnapToBulnes && (
          <button
            type="button"
            onClick={onSnapToBulnes}
            className="w-full mb-3 py-2.5 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-98"
          >
            <Navigation className="w-3.5 h-3.5 text-black" />
            <span>📍 Poner junto a Clocks en Calle Bulnes</span>
          </button>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Cancelar</span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="py-3 px-4 rounded-xl bg-black hover:bg-stone-800 text-white text-xs font-bold shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Ubicación</span>
          </button>
        </div>
      </div>
    </div>
  );
};
