import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  login: string;
  role: number; // 1 - Physicist, 2 - Professor
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuth: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('jwt'),
  isAuth: !!localStorage.getItem('jwt'),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuth = true;
      localStorage.setItem('jwt', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuth = false;
      localStorage.removeItem('jwt');
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;