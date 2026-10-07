import React, { useState } from 'react';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  checkIsAdmin,
} from '../services/firebase';
import { ShieldCheck, Lock, Mail, AlertCircle, X, Sparkles, LogIn } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (isAdmin: boolean) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      }

      const isAdmin = await checkIsAdmin(userCredential.user);
      setLoading(false);
      onSuccess(isAdmin);
      onClose();
    } catch (err: unknown) {
      setLoading(false);
      const error = err as { code?: string; message?: string };
      console.error('Auth error:', error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setErrorMessage('Correo o contraseña incorrectos.');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMessage('No existe un usuario con este correo. ¿Deseas registrarte?');
      } else if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Este correo ya está registrado. Por favor, inicia sesión.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('El formato de correo no es válido.');
      } else {
        setErrorMessage('Error al autenticar. Verifica tu conexión e inténtalo de nuevo.');
      }
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isAdmin = await checkIsAdmin(result.user);
      setLoading(false);
      onSuccess(isAdmin);
      onClose();
    } catch (err: unknown) {
      setLoading(false);
      const error = err as { code?: string; message?: string };
      console.error('Google auth error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        setErrorMessage('No se pudo completar el inicio de sesión con Google.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header Header */}
        <div className="bg-[#2b2b28] text-white p-6 pb-7">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif tracking-tight">Acceso Administrador</h2>
              <p className="text-xs text-stone-300">Gestión de locales y cafeterías en la nube</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-5">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-sm font-semibold flex items-center justify-center gap-3 transition shadow-sm active:scale-98 disabled:opacity-50 mb-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>Continuar con Google</span>
          </button>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <span className="relative bg-white px-3 text-xs text-stone-400 font-medium uppercase tracking-wider">
              o con correo y contraseña
            </span>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej. jonathan@ejemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2b2b28] focus:border-transparent text-sm bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2b2b28] focus:border-transparent text-sm bg-stone-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-[#2b2b28] hover:bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 transition shadow-md active:scale-98 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isRegistering ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Crear Cuenta</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle login vs register */}
          <div className="mt-4 pt-4 border-t border-stone-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrorMessage(null);
              }}
              className="text-xs text-stone-600 hover:text-black font-medium transition underline"
            >
              {isRegistering
                ? '¿Ya tienes cuenta? Inicia sesión aquí'
                : '¿No tienes cuenta aún? Regístrate aquí'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
