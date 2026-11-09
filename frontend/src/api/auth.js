import api from './client.js';

// Sign-up and password reset are both confirmed with a 6-digit code sent by e-mail.
export const registerUser = (data) => api.post('/auth/register', data);
export const verifyRegistration = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const resendOtp = (email, purpose) => api.post('/auth/resend-otp', { email, purpose });
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (data) => api.post('/auth/reset-password', data);
