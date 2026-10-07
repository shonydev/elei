import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  variant?: 'header' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 font-bold transition active:scale-95 shadow-xl ${
          variant === 'header'
            ? 'rounded-full bg-white hover:bg-stone-50 text-black border border-black/10 px-3.5 py-2.5 text-xs'
            : 'rounded-xl bg-black hover:bg-stone-800 text-white px-4 py-2.5 text-sm shadow-md'
        }`}
        title="Instalar como aplicación en tu dispositivo"
      >
        <Download className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 font-bold border transition shadow-xl ${
            variant === 'header'
              ? 'rounded-full border-black/10 bg-white hover:bg-stone-50 text-black px-3.5 py-2.5 text-xs'
              : 'rounded-xl border-black/10 bg-white hover:bg-stone-50 text-black px-4 py-2 text-xs'
          }`}
          title="Instalar en iPhone o iPad"
        >
          <Share className="w-3.5 h-3.5 text-blue-600" />
          <span>Instalar PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl relative text-stone-900">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-md">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Instalar en iOS (iPhone / iPad)</h3>
                  <p className="text-xs text-stone-500">Agrega el mapa a tu pantalla de inicio</p>
                </div>
              </div>

              <div className="space-y-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs text-stone-700">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <p>
                    Toca el botón <strong className="inline-flex items-center gap-1 font-semibold text-stone-900"><Share className="w-3.5 h-3.5 inline text-sky-600" /> Compartir</strong> en la barra inferior de Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <p>
                    Desliza hacia abajo y presiona <strong className="inline-flex items-center gap-1 font-semibold text-stone-900"><PlusSquare className="w-3.5 h-3.5 inline text-stone-700" /> Agregar a pantalla de inicio</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-amber-600 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
