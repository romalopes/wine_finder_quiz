import { API_BASE_URL } from "./api.js";

const TOKEN_STORAGE_KEY = "wine_prediction_token";

function getStoredToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export const useApi = () => {
  const apiFetch = async (path, options = {}) => {
    const token = getStoredToken();

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  return { apiFetch };
};
