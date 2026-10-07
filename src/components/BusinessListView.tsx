import React from 'react';
import { Business } from '../types';
import { CATEGORIES } from '../data/initialBusinesses';
import { Star, MapPin, Trash2, Move, FileSpreadsheet } from 'lucide-react';

interface BusinessListViewProps {
  businesses: Business[];
  onSelectBusiness: (business: Business) => void;
  onOpenAddModal: () => void;
  onRequestDelete: (business: Business) => void;
  onStartRelocation?: (business: Business) => void;
  onResetDefaults?: () => void;
  onExportCSV?: () => void;
  isAdmin: boolean;
}

export const BusinessListView: React.FC<BusinessListViewProps> = ({
  businesses,
  onSelectBusiness,
  onOpenAddModal,
  onRequestDelete,
  onStartRelocation,
  onResetDefaults,
  onExportCSV,
  isAdmin,
}) => {
  if (businesses.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-stone-50">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-3xl mb-3 shadow-inner">
          ☕
        </div>
        <h3 className="text-base font-bold text-stone-900">No se encontraron locales</h3>
        <p className="text-xs text-stone-500 max-w-sm mt-1 mb-4">
          Intenta con otro término de búsqueda o categoría en Los Ángeles.
        </p>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-black text-white font-bold text-xs hover:bg-stone-800 shadow-md transition"
            >
              + Agregar Cafetería
            </button>
            {onResetDefaults && (
              <button
                onClick={onResetDefaults}
                className="px-4 py-2 rounded-xl bg-stone-200 text-stone-800 font-bold text-xs hover:bg-stone-300 transition"
              >
                Restaurar Originales
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#ebeef2] no-scrollbar">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">
            {businesses.length} {businesses.length === 1 ? 'local encontrado' : 'locales encontrados'} en Los Ángeles
          </span>
          <div className="flex items-center gap-2">
            {isAdmin && onExportCSV && (
              <button
                type="button"
                onClick={onExportCSV}
                className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-800 text-xs font-bold hover:bg-stone-50 shadow-xs flex items-center gap-1.5 transition active:scale-95"
                title="Exportar todas las cafeterías a un archivo .CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Exportar CSV</span>
              </button>
            )}
            {isAdmin && onResetDefaults && (
              <button
                onClick={onResetDefaults}
                className="text-xs font-semibold text-stone-500 hover:text-black transition"
              >
                Restaurar locales sugeridos
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businesses.map((b) => {
            const cat = CATEGORIES[b.category] || CATEGORIES.cafeteria;
            return (
              <div
                key={b.id}
                onClick={() => onSelectBusiness(b)}
                className="group bg-white rounded-2xl p-4 shadow-sm border border-stone-200/80 hover:shadow-md hover:border-black/30 transition cursor-pointer flex gap-4 items-start relative"
              >
                {/* Circular image indicator */}
                <div className="relative shrink-0">
                  <div
                    className="w-16 h-16 rounded-full border-2 border-black overflow-hidden shadow-sm bg-stone-100 group-hover:scale-105 transition transform"
                  >
                    <img
                      src={b.imageUrl}
                      alt={b.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center border border-white shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.emoji}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-12">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.label}
                    </span>
                    <span className="text-[10px] font-mono text-stone-600 font-bold">
                      {b.priceLevel}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-stone-900 truncate group-hover:text-black">
                    {b.name}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                    {b.description}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-stone-600">
                    <span className="flex items-center gap-1 font-semibold text-stone-900">
                      <Star className="w-3 h-3 fill-current text-amber-500" />
                      {b.rating.toFixed(1)}
                    </span>
                    <span className="truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      {b.address.split(',')[0]}
                    </span>
                  </div>
                </div>

                {/* Action Buttons on Card (ADMIN ONLY) */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    {onStartRelocation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartRelocation(b);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-black hover:bg-stone-100 transition active:scale-90"
                        title="Reubicar este negocio en el mapa"
                      >
                        <Move className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestDelete(b);
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition active:scale-90"
                      title="Eliminar este negocio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
