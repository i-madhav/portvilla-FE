import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiClient, getAccessToken, getRefreshToken, setTokens, clearTokens } from '@app/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MessageResponse {
  message: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface LoginWithOtpPayload {
  email: string;
  otp: string;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastMessage: string | null;
}

// ─── Persistence helpers ───────────────────────────────────────────────────────

// Persistence lives in the API layer's token store: it is the same storage the
// HTTP client reads on every request, so the two cannot drift, and it is the
// only copy that is guarded against localStorage throwing in private mode.

function loadTokens(): Pick<AuthState, 'accessToken' | 'refreshToken'> {
  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
  };
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const register = createAsyncThunk<MessageResponse, RegisterPayload>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      return await apiClient.post<MessageResponse>('/auth/register', payload);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const verifyEmail = createAsyncThunk<MessageResponse, VerifyOtpPayload>(
  'auth/verifyEmail',
  async (payload, { rejectWithValue }) => {
    try {
      return await apiClient.post<MessageResponse>('/auth/verify-email', payload);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const resendOtp = createAsyncThunk<MessageResponse, string>(
  'auth/resendOtp',
  async (email, { rejectWithValue }) => {
    try {
      return await apiClient.post<MessageResponse>('/auth/resend-otp', { email });
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const login = createAsyncThunk<TokenResponse, LoginPayload>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      return await apiClient.post<TokenResponse>('/auth/login', payload);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const requestLoginOtp = createAsyncThunk<MessageResponse, string>(
  'auth/requestLoginOtp',
  async (email, { rejectWithValue }) => {
    try {
      return await apiClient.post<MessageResponse>('/auth/login/otp/request', { email });
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const loginWithOtp = createAsyncThunk<TokenResponse, LoginWithOtpPayload>(
  'auth/loginWithOtp',
  async (payload, { rejectWithValue }) => {
    try {
      return await apiClient.post<TokenResponse>('/auth/login/otp', payload);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const refreshTokens = createAsyncThunk<TokenResponse, void>(
  'auth/refreshTokens',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    // Falls back to storage so a token another tab just rotated is used even
    // though this tab's slice has not caught up yet.
    const token = state.auth.refreshToken ?? getRefreshToken();
    if (!token) return rejectWithValue('No refresh token');
    try {
      return await apiClient.post<TokenResponse>('/auth/refresh', { refreshToken: token });
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const logout = createAsyncThunk<MessageResponse, void>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      return await apiClient.post<MessageResponse>('/auth/logout', undefined, true);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState: AuthState = {
  ...loadTokens(),
  status: 'idle',
  error: null,
  lastMessage: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearMessage(state) {
      state.lastMessage = null;
    },
    /** Set tokens and persist to localStorage (used by react-query hooks) */
    setTokensAndPersist(state, action: PayloadAction<TokenResponse>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      setTokens(action.payload.accessToken, action.payload.refreshToken);
    },
    /** Clear tokens from state and localStorage (used by react-query hooks) */
    clearTokensAndState(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.status = 'idle';
      state.error = null;
      state.lastMessage = null;
      clearTokens();
    },
  },
  extraReducers: (builder) => {
    const pending = (state: AuthState) => {
      state.status = 'loading';
      state.error = null;
    };
    const failed = (state: AuthState, action: { payload: unknown }) => {
      state.status = 'failed';
      state.error = (action.payload as string) ?? 'Something went wrong.';
    };

    // register
    builder
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastMessage = action.payload.message;
      })
      .addCase(register.rejected, failed);

    // verifyEmail
    builder
      .addCase(verifyEmail.pending, pending)
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastMessage = action.payload.message;
      })
      .addCase(verifyEmail.rejected, failed);

    // resendOtp
    builder
      .addCase(resendOtp.pending, pending)
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastMessage = action.payload.message;
      })
      .addCase(resendOtp.rejected, failed);

    // login
    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        setTokens(action.payload.accessToken, action.payload.refreshToken);
      })
      .addCase(login.rejected, failed);

    // requestLoginOtp
    builder
      .addCase(requestLoginOtp.pending, pending)
      .addCase(requestLoginOtp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastMessage = action.payload.message;
      })
      .addCase(requestLoginOtp.rejected, failed);

    // loginWithOtp
    builder
      .addCase(loginWithOtp.pending, pending)
      .addCase(loginWithOtp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        setTokens(action.payload.accessToken, action.payload.refreshToken);
      })
      .addCase(loginWithOtp.rejected, failed);

    // refreshTokens
    builder
      .addCase(refreshTokens.pending, pending)
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        setTokens(action.payload.accessToken, action.payload.refreshToken);
      })
      .addCase(refreshTokens.rejected, (state, action) => {
        failed(state, action);
        state.accessToken = null;
        state.refreshToken = null;
        clearTokens();
      });

    // logout
    builder
      .addCase(logout.pending, pending)
      .addCase(logout.fulfilled, (state) => {
        state.status = 'idle';
        state.accessToken = null;
        state.refreshToken = null;
        state.lastMessage = null;
        clearTokens();
      })
      .addCase(logout.rejected, (state) => {
        // still clear local state even if server call fails
        state.status = 'idle';
        state.accessToken = null;
        state.refreshToken = null;
        clearTokens();
      });
  },
});

export const { clearError, clearMessage, setTokensAndPersist, clearTokensAndState } = authSlice.actions;
export default authSlice.reducer;
