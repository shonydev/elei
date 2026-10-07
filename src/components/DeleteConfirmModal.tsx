import React from 'react';
import { Business } from '../types';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  business,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !business) return null;

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-stone-200 text-black relative animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-black">Eliminar del mapa</h3>
            <p className="text-xs text-stone-500">Esta acción no se puede deshacer</p>
          </div>
        </div>

        {/* Business Preview */}
        <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200/80 my-3">
          <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden shrink-0 shadow-sm">
            <img
              src={business.imageUrl}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-black truncate">{business.name}</h4>
            <p className="text-xs text-stone-500 truncate">{business.address}</p>
          </div>
        </div>

        <p className="text-xs text-stone-600 mb-5 leading-relaxed">
          ¿Estás seguro de que deseas eliminar <strong>"{business.name}"</strong>? Desaparecerá inmediatamente del mapa de Los Ángeles.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Sí, eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
