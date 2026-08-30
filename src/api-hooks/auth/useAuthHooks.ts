import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useToast } from '@app/providers/toast';
import { useAppDispatch } from '@stores/store';
import { setTokensAndPersist, clearTokensAndState } from '@stores/authSlice';
import type {
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ProfileResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  VerifyOtpPayload,
  LoginWithOtpPayload,
} from '@typings/authApi';
import {
  login as loginApi,
  register as registerApi,
  getProfile,
  changePassword as changePasswordApi,
  logout as logoutApi,
  verifyEmail as verifyEmailApi,
  resendOtp as resendOtpApi,
  requestLoginOtp as requestLoginOtpApi,
  loginWithOtp as loginWithOtpApi,
} from './authApiFns';

// ─── Query keys ──────────────────────────────────────────────────────────────

export const authKeys = {
  all: ['auth'] as const,
  profile: () => ['auth', 'profile'] as const,
} as const;

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useLogin() {
  const { showToast } = useToast();
  const dispatch = useAppDispatch();

  return useMutation<LoginResponse, Error, { email: string; password: string }>({
    mutationFn: ({ email, password }) => loginApi(email, password),
    onSuccess: (data) => {
      dispatch(setTokensAndPersist({ accessToken: data.accessToken, refreshToken: data.refreshToken }));
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Login failed',
        message: error.message,
      });
    },
  });
}

export function useRegister() {
  const { showToast } = useToast();

  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: (payload) => registerApi(payload),
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Registration failed',
        message: error.message,
      });
    },
  });
}

export function useVerifyEmail() {
  const { showToast } = useToast();

  return useMutation<RegisterResponse, Error, VerifyOtpPayload>({
    mutationFn: (payload) => verifyEmailApi(payload) as Promise<RegisterResponse>,
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Verification failed',
        message: error.message,
      });
    },
  });
}

export function useResendOtp() {
  const { showToast } = useToast();

  return useMutation<RegisterResponse, Error, string>({
    mutationFn: (email) => resendOtpApi({ email }) as Promise<RegisterResponse>,
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Failed to resend code',
        message: error.message,
      });
    },
  });
}

export function useRequestLoginOtp() {
  const { showToast } = useToast();

  return useMutation<RegisterResponse, Error, string>({
    mutationFn: (email) => requestLoginOtpApi(email) as Promise<RegisterResponse>,
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Failed to send code',
        message: error.message,
      });
    },
  });
}

export function useLoginWithOtp() {
  const { showToast } = useToast();
  const dispatch = useAppDispatch();

  return useMutation<LoginResponse, Error, LoginWithOtpPayload>({
    mutationFn: (payload) => loginWithOtpApi(payload),
    onSuccess: (data) => {
      dispatch(setTokensAndPersist({ accessToken: data.accessToken, refreshToken: data.refreshToken }));
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Login failed',
        message: error.message,
      });
    },
  });
}

export function useProfileQuery(enabled: boolean = true) {
  const { showToast } = useToast();

  const query = useQuery<ProfileResponse, Error>({
    queryKey: authKeys.profile(),
    queryFn: () => getProfile(),
    enabled,
    staleTime: 30_000,
    retry: 1,
  });

  useEffect(() => {
    if (!query.error) return;
    showToast({
      type: 'error',
      title: 'Failed to load profile',
      message: query.error.message,
    });
  }, [query.error, showToast]);

  return query;
}

export function useChangePassword() {
  const { showToast } = useToast();

  return useMutation<ChangePasswordResponse, Error, ChangePasswordPayload>({
    mutationFn: (payload) => changePasswordApi(payload),
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Password updated',
        message: 'Your password has been changed successfully.',
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Password change failed',
        message: error.message,
      });
    },
  });
}

export function useLogout() {
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      dispatch(clearTokensAndState());
      queryClient.clear();
      showToast({
        type: 'success',
        title: 'Logged out',
        message: 'You have been logged out successfully.',
      });
    },
    onError: (error) => {
      // Still clear local state even if server call fails
      dispatch(clearTokensAndState());
      queryClient.clear();
      showToast({
        type: 'error',
        title: 'Logout failed',
        message: error.message,
      });
    },
  });
}
