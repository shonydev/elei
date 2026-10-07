import React, { useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
  undoAction?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  undoAction,
}) => {
  // onClose llega como función inline (cambia en cada render del padre); se guarda en
  // una ref para que el temporizador de 4s no se reinicie con cada re-render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onCloseRef.current();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[4500] max-w-sm w-[90%] pointer-events-auto animate-in slide-in-from-top-2 duration-200">
      <div className="bg-black/95 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2.5 truncate">
          {type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="truncate">{message}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {undoAction && (
            <button
              onClick={() => {
                undoAction();
                onClose();
              }}
              className="text-amber-300 hover:text-amber-200 font-bold underline text-xs"
            >
              Deshacer
            </button>
          )}
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
