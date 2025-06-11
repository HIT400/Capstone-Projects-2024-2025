// utils/auth.ts
// utils/auth.ts

// type UserRole = 'admin' | 'applicant' | 'inspector';

// interface AuthResponse {
//   token: string;
//   role: UserRole;
//   expiresIn?: number;
// }

// export const validateAuthResponse = (data: any): AuthResponse => {
//   if (!data || typeof data !== 'object') {
//     throw new Error('Invalid response format');
//   }

//   if (!data.token || typeof data.token !== 'string') {
//     throw new Error('Missing or invalid token in response');
//   }

//   if (!data.role || !['admin', 'applicant', 'inspector'].includes(data.role)) {
//     throw new Error('Missing or invalid role in response');
//   }

//   return {
//     token: data.token,
//     role: data.role,
//     expiresIn: data.expiresIn
//   };
// };

// export const getAuthToken = () => {
//   if (typeof window !== 'undefined') {
//     return localStorage.getItem('token');
//   }
//   return null;
// };

// export const setAuthToken = (token: string, role: string) => {
//   if (typeof window !== 'undefined') {
//     localStorage.setItem('token', token);
//     localStorage.setItem('userRole', role);
//   }
// };

// export const getCurrentRole = () => {
//   if (typeof window !== 'undefined') {
//     return localStorage.getItem('userRole') as 'admin' | 'applicant' | 'inspector' | null;
//   }
//   return null;
// };

// export const clearAuthData = () => {
//   if (typeof window !== 'undefined') {
//     localStorage.removeItem('token');
//     localStorage.removeItem('userRole');
//   }
// };