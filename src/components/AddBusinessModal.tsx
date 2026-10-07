import React, { useState } from 'react';
import { Business, BusinessCategory } from '../types';
import { CATEGORIES, PRESET_IMAGES } from '../data/initialBusinesses';
import { processImageToSquare } from '../utils/imageHelper';
import { X, Upload, MapPin, Sparkles, Check, Image as ImageIcon, Camera, Phone, Clock, Instagram } from 'lucide-react';

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (business: Omit<Business, 'id' | 'createdAt' | 'rating' | 'reviewsCount'>) => void;
  initialCoords: { lat: number; lng: number } | null;
  onStartMapPick: () => void;
}

export const AddBusinessModal: React.FC<AddBusinessModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCoords,
  onStartMapPick,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('cafeteria');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number>(initialCoords?.lat || -37.4697);
  const [lng, setLng] = useState<number>(initialCoords?.lng || -72.3537);
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [priceLevel, setPriceLevel] = useState<'$' | '$$' | '$$$'>('$$');
  const [openingHours, setOpeningHours] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tagsInput, setTagsInput] = useState('Wi-Fi, Terraza');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync coords if updated outside
  React.useEffect(() => {
    if (initialCoords) {
      setLat(Number(initialCoords.lat.toFixed(6)));
      setLng(Number(initialCoords.lng.toFixed(6)));
    }
  }, [initialCoords]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      setErrorMessage(null);
      const squareDataUrl = await processImageToSquare(file, 400);
      setImageUrl(squareDataUrl);
    } catch (err) {
      console.error(err);
      setErrorMessage('Error al procesar la foto. Por favor prueba con otra imagen.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Por favor escribe el nombre de la cafetería o negocio');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      name: name.trim(),
      category,
      description: description.trim() || 'Cafetería y local en Los Ángeles, Biobío.',
      address: address.trim() || 'Los Ángeles, Región del Biobío',
      lat: Number(lat),
      lng: Number(lng),
      imageUrl: imageUrl || PRESET_IMAGES[0].url,
      priceLevel,
      openingHours: openingHours.trim() || undefined,
      phone: phone.trim() || undefined,
      instagram: instagram.trim() ? (instagram.startsWith('@') ? instagram : `@${instagram}`) : undefined,
      tags: tags.length > 0 ? tags : ['Cafetería'],
    });

    onClose();
  };

  const selectedCatInfo = CATEGORIES[category] || CATEGORIES.cafeteria;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-black text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black">Agregar Cafetería o Negocio</h2>
              <p className="text-xs text-stone-400">Los Ángeles, Región del Biobío, Chile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[80vh] overflow-y-auto no-scrollbar">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-500 hover:text-red-800 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Circular Marker Live Preview (Hero Section) */}
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-black bg-stone-200 px-2.5 py-0.5 rounded-md inline-block mb-1">
                Marcador Circular estilo Uber
              </span>
              <p className="text-xs text-stone-600 max-w-xs font-medium">
                Esta es la apariencia exacta con la que aparecerá tu cafetería flotando sobre el mapa de Los Ángeles:
              </p>
            </div>

            {/* Live circular pin simulation */}
            <div className="relative flex flex-col items-center shrink-0">
              <span className="mb-1.5 bg-white text-black text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md border border-stone-200">
                {name || 'Mi Cafetería'}
              </span>
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-full border-2 border-black shadow-xl overflow-hidden bg-white transition-all transform hover:scale-105"
                >
                  {isProcessingImage ? (
                    <div className="w-full h-full flex items-center justify-center bg-stone-200 text-xs text-stone-600">
                      ...
                    </div>
                  ) : (
                    <img
                      src={imageUrl}
                      alt="Preview circular"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center border border-white">
                  {selectedCatInfo.emoji}
                </span>
              </div>
              <div className="w-0.5 h-2.5 bg-black" />
              <div className="w-2 h-2 rounded-full bg-black border-2 border-white shadow-xs" />
            </div>
          </div>

          {/* Image Selection Methods */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
              1. Seleccionar Foto Circular
            </label>

            {/* Upload Button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-amber-500 bg-amber-50/60 hover:bg-amber-100/60 text-amber-900 cursor-pointer transition text-xs font-semibold">
                <Camera className="w-4 h-4 text-amber-600" />
                <span>{isProcessingImage ? 'Procesando...' : 'Subir foto o tomar foto'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* URL toggle input */}
              <div className="flex gap-1.5">
                <input
                  type="url"
                  placeholder="O pega URL de imagen..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customUrlInput) setImageUrl(customUrlInput);
                  }}
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium shrink-0"
                >
                  Usar
                </button>
              </div>
            </div>

            {/* Quick Presets Gallery */}
            <div className="pt-1">
              <span className="text-[11px] text-stone-500 block mb-1.5 font-medium">
                O elige una foto sugerida:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative w-full aspect-square rounded-full overflow-hidden border-2 transition ${
                      imageUrl === preset.url
                        ? 'border-amber-600 ring-2 ring-amber-400 scale-105'
                        : 'border-stone-200 hover:border-amber-400 opacity-80 hover:opacity-100'
                    }`}
                    title={preset.name}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    {imageUrl === preset.url && (
                      <div className="absolute inset-0 bg-amber-600/30 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Business Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                Nombre del Negocio *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Café Central Los Ángeles"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BusinessCategory)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 bg-white"
              >
                {Object.values(CATEGORIES).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address & Coordinate Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
              Ubicación en Los Ángeles, Biobío
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Dirección (Ej. Calle Colón 450, Av. Alemania...)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => {
                  onStartMapPick();
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shrink-0 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Marcar en el mapa</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-500 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
              <span className="font-semibold text-stone-700">Coordenadas:</span>
              <span>Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
              Descripción & Especialidades
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Cafetería de especialidad con granos de Colombia y Etiopía, rica pastelería francesa y mesas con Wi-Fi..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Details: Opening Hours, Phone, Instagram, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" /> Horario
              </label>
              <input
                type="text"
                placeholder="Lun a Sáb 08:30 - 20:00"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-stone-400" /> Tel / WhatsApp
              </label>
              <input
                type="text"
                placeholder="+56 9 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1">
                <Instagram className="w-3 h-3 text-stone-400" /> Instagram
              </label>
              <input
                type="text"
                placeholder="@tunegocio"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Tags & Price Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Rango de Precios
              </label>
              <div className="flex gap-2">
                {(['$', '$$', '$$$'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriceLevel(lvl)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition border ${
                      priceLevel === lvl
                        ? 'bg-black text-white border-black'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Etiquetas (separadas por coma)
              </label>
              <input
                type="text"
                placeholder="Wi-Fi, Terraza, Pet Friendly, Desayuno"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-black hover:bg-stone-800 text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition"
            >
              Guardar y Ver en el Mapa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
