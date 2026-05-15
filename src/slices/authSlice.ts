import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AuthApi } from '../api/generated';

export const loginUser = createAsyncThunk('auth/login', async (data: any) => {
  const response = await AuthApi.login(data);
  return response.data; // Ожидается объект { user, token }
});

export const registerUser = createAsyncThunk('auth/register', async (data: any) => {
  const response = await AuthApi.register(data);
  return response.data;
});

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
if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
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
    // Оставили на случай ручного обновления
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
      // localStorage.removeItem('jwt');
      // localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    // ОБРАБОТКА THUNK
    builder.addCase(loginUser.fulfilled, (state, action) => {
      // Подставь здесь правильные поля из твоего бэкенда (например, action.payload.user и action.payload.token)
      const user = action.payload.user || action.payload; 
      const token = action.payload.token || action.payload.Token;

      state.user = user;
      state.token = token;
      state.isAuth = true;
      
      if (token) localStorage.setItem('jwt', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
    });

    builder.addCase(registerUser.fulfilled, (state, action) => {
      // То же самое для регистрации, если бэкенд сразу авторизует после регистрации
      const user = action.payload.user || action.payload;
      const token = action.payload.token || action.payload.Token;

      if (token && user) {
        state.user = user;
        state.token = token;
        state.isAuth = true;
        localStorage.setItem('jwt', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
    });
  }
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;