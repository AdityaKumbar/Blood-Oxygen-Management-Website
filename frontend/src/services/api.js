import axios from "axios";
import { logout } from "../redux/authSlice";
import { startGlobalLoading, stopGlobalLoading } from "../redux/uiSlice";
import { readScopedAuthSession } from "../utils/authStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 10000,
});

let interceptorsInitialized = false;

export const setupInterceptors = (store) => {
  if (interceptorsInitialized) return;
  interceptorsInitialized = true;

  api.interceptors.request.use(
    (config) => {
      store.dispatch(startGlobalLoading());
      let token = store.getState().auth.token;
      
      // Fallback to localStorage if token not in Redux store
      if (!token) {
        token = readScopedAuthSession().token;
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      store.dispatch(stopGlobalLoading());
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      store.dispatch(stopGlobalLoading());
      return response;
    },
    (error) => {
      store.dispatch(stopGlobalLoading());
      if (error?.response?.status === 401) {
        store.dispatch(logout());
      }
      return Promise.reject(error);
    }
  );
};

export default api;
