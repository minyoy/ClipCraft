import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchCurrentUser, login as loginRequest, logout as logoutRequest, signup as signupRequest, type AuthTokens, type AuthUser } from '@/api/auth';
import { clearTokens, loadAccessToken, loadRefreshToken, saveTokens } from '@/lib/authStorage';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
  marketingConsent?: boolean;
}

interface AuthContextValue {
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  user: AuthUser | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

function applyTokens(tokens: AuthTokens): void {
  saveTokens(tokens.access_token, tokens.refresh_token);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = loadAccessToken();

    if (!token) {
      setLoading(false);
      return;
    }

    fetchCurrentUser(token)
      .then((currentUser) => {
        setUser(currentUser);
        setAccessToken(token);
      })
      .catch(() => {
        clearTokens();
        setUser(null);
        setAccessToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = true) => {
    const tokens = await loginRequest({ email, password, remember_me: rememberMe });
    applyTokens(tokens);
    setUser(tokens.user);
    setAccessToken(tokens.access_token);
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const tokens = await signupRequest({
      name: input.name,
      email: input.email,
      password: input.password,
      terms_accepted: input.termsAccepted,
      marketing_consent: input.marketingConsent ?? false,
    });
    applyTokens(tokens);
    setUser(tokens.user);
    setAccessToken(tokens.access_token);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = loadRefreshToken();
    clearTokens();
    setUser(null);
    setAccessToken(null);

    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch {
        // best-effort server-side revoke; local session is already cleared
      }
    }
  }, []);

  const value = useMemo(() => ({ accessToken, loading, login, logout, signup, user }), [accessToken, loading, login, logout, signup, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
