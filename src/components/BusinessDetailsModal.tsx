import React from 'react';
import { Business } from '../types';
import { CATEGORIES } from '../data/initialBusinesses';
import {
  X,
  MapPin,
  Clock,
  Phone,
  Instagram,
  Navigation,
  Star,
  Trash2,
  Share2,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

interface BusinessDetailsModalProps {
  business: Business | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onShowOnMap: (business: Business) => void;
  isAdmin: boolean;
}

export const BusinessDetailsModal: React.FC<BusinessDetailsModalProps> = ({
  business,
  onClose,
  onDelete,
  onShowOnMap,
  isAdmin,
}) => {
  if (!business) return null;

  const category = CATEGORIES[business.category] || CATEGORIES.cafeteria;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${business.name} - Los Ángeles, Chile`,
        text: `Descubre ${business.name} en Los Ángeles, Biobío: ${business.description}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${business.name} - ${business.address}`);
      alert('Información copiada al portapapeles');
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${business.name} ${business.address} Los Ángeles Chile`
  )}`;

  const cleanPhone = business.whatsapp || business.phone?.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-[2500] flex sm:items-center sm:justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 sm:duration-200">
        {/* Hero Image with Circular Marker Overlay */}
        <div className="relative h-48 sm:h-56 bg-stone-900 overflow-hidden shrink-0">
          <img
            src={business.imageUrl}
            alt={business.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

          {/* Top buttons */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md flex items-center gap-1.5 backdrop-blur-md"
              style={{ backgroundColor: category.color }}
            >
              <span>{category.emoji}</span>
              <span>{category.label}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition"
                title="Compartir local"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title & Circular Marker in Hero */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3">
            {/* The circular marker avatar representation */}
            <div
              className="w-16 h-16 rounded-full border-3 shadow-xl overflow-hidden bg-white shrink-0 -mb-2"
              style={{ borderColor: category.color }}
            >
              <img
                src={business.imageUrl}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-white truncate drop-shadow-md">
                {business.name}
              </h2>
              <div className="flex items-center gap-2 text-stone-200 text-xs mt-0.5">
                <span className="flex items-center gap-0.5 font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {business.rating.toFixed(1)}
                </span>
                <span>•</span>
                <span className="font-mono font-bold text-white">{business.priceLevel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* Description */}
          <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
            {business.description}
          </p>

          {/* Details list */}
          <div className="space-y-2.5 text-xs text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-100">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-900">{business.address}</p>
                <p className="text-[11px] text-stone-500">Los Ángeles, Región del Biobío</p>
              </div>
            </div>

            {business.openingHours && (
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="font-medium">{business.openingHours}</span>
              </div>
            )}

            {business.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                <a
                  href={`tel:${business.phone}`}
                  className="font-medium hover:text-black hover:underline"
                >
                  {business.phone}
                </a>
              </div>
            )}

            {business.instagram && (
              <div className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-stone-400 shrink-0" />
                <a
                  href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-pink-600 hover:underline"
                >
                  {business.instagram}
                </a>
              </div>
            )}
          </div>

          {/* Tags */}
          {business.tags && business.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {business.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Cómo Llegar</span>
              <ExternalLink className="w-3 h-3 text-amber-200" />
            </a>

            {cleanPhone ? (
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            ) : (
              <button
                onClick={() => {
                  onShowOnMap(business);
                  onClose();
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs transition shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Enfocar en Mapa</span>
              </button>
            )}
          </div>

          {/* Delete Option (ADMIN ONLY) */}
          {isAdmin && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  onDelete(business.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 p-1 font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar este local</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
