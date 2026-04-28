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

const storedToken = localStorage.getItem('jwt');
const storedUser = localStorage.getItem('user');

// Безопасный парсинг пользователя
let parsedUser = null;
// Проверяем, что storedUser существует и не равен строке "undefined"
if (storedUser && storedUser !== 'undefined') {
  try {
    parsedUser = JSON.parse(storedUser);
  } catch (error) {
    console.error('Ошибка парсинга пользователя из localStorage:', error);
  }
}

const initialState: AuthState = {
  user: parsedUser,
  token: storedToken && storedToken !== 'undefined' ? storedToken : null,
  isAuth: !!(storedToken && storedToken !== 'undefined'),
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
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuth = false;
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;