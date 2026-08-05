'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import { setTokens, clearTokens, setTokenUpdateCallback } from '@/lib/api-client';
import { refreshFuncionario, getMePerfil, logoutFuncionario } from '@/services/funcionario.service';
import { FUNC_STORAGE, SESSION_COOKIE_NAME, FUNC_ROUTES } from '@/lib/constants';
import type { UsuarioPerfil, AuthStatus } from '@/types/funcionario';

/* ── Helpers de storage ──────────────────────── */

function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    sessionStorage.getItem(FUNC_STORAGE.refreshToken) ??
    localStorage.getItem(FUNC_STORAGE.refreshToken)
  );
}

function storeRefreshToken(token: string, remember: boolean): void {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(FUNC_STORAGE.refreshToken, token);
  if (remember) {
    localStorage.setItem(FUNC_STORAGE.rememberMe, '1');
  }
}

function isRemembered(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(FUNC_STORAGE.rememberMe) === '1';
}

function clearStoredTokens(): void {
  sessionStorage.removeItem(FUNC_STORAGE.refreshToken);
  localStorage.removeItem(FUNC_STORAGE.refreshToken);
  localStorage.removeItem(FUNC_STORAGE.rememberMe);
}

function setSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE_NAME}=1; path=/funcionario; SameSite=Strict`;
}

function clearSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/funcionario; max-age=0; SameSite=Strict`;
}

/* ── Tipos del contexto ───────────────────────── */

interface AuthContextValue {
  user: UsuarioPerfil | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (access: string, refresh: string, user: UsuarioPerfil, remember: boolean) => void;
  logout: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ── Provider ─────────────────────────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioPerfil | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const bootstrapped = useRef(false);

  /* Sincroniza el storage cuando el interceptor 401 rota los tokens */
  useEffect(() => {
    setTokenUpdateCallback((access, refresh) => {
      const remember = isRemembered();
      storeRefreshToken(refresh, remember);
      setTokens(access, refresh); // ya lo hace el interceptor, es idempotente
    });
    return () => setTokenUpdateCallback(null);
  }, []);

  /* Bootstrap: intenta restaurar sesión desde storage */
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const stored = getStoredRefreshToken();
    if (!stored) {
      setStatus('unauthenticated');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { access_token, refresh_token } = await refreshFuncionario(stored);
        if (cancelled) return;

        setTokens(access_token, refresh_token);
        const remember = isRemembered();
        storeRefreshToken(refresh_token, remember);
        setSessionCookie();

        const profile = await getMePerfil();
        if (cancelled) return;

        setUser(profile);
        setStatus('authenticated');
      } catch {
        if (cancelled) return;
        clearTokens();
        clearStoredTokens();
        clearSessionCookie();
        setStatus('unauthenticated');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    (access: string, refresh: string, profile: UsuarioPerfil, remember: boolean) => {
      setTokens(access, refresh);
      storeRefreshToken(refresh, remember);
      setSessionCookie();
      setUser(profile);
      setStatus('authenticated');
    },
    [],
  );

  const logout = useCallback(async () => {
    const stored = getStoredRefreshToken();
    try {
      if (stored) await logoutFuncionario(stored);
    } catch {
      // logout best-effort — siempre limpiamos localmente
    } finally {
      clearTokens();
      clearStoredTokens();
      clearSessionCookie();
      setUser(null);
      setStatus('unauthenticated');
      window.location.href = FUNC_ROUTES.login;
    }
  }, []);

  const hasRole = useCallback(
    (role: string | string[]) => {
      if (!user) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.some(
        (r) =>
          user.rol.slug === r.toLowerCase() || user.rol.nombre.toLowerCase() === r.toLowerCase(),
      );
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isAuthenticated: status === 'authenticated',
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ── Hook ─────────────────────────────────────── */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
