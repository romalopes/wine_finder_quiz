import { authClient } from "../contexts/Auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const TOKEN_STORAGE_KEY = "wine_prediction_token";

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

async function request(
  path,
  { method = "GET", body, auth = false, headers = {} } = {},
) {
  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  console.log(method, body, auth, headers);
  let payload;
  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (auth) {
    // const token = getStoredToken();
    // const { user, session, signOut } = useAuth();
    const result = await authClient.getSession();

    const session = result.data?.session;

    if (session) {
      requestHeaders.Authorization = `Bearer ${session.token}`;
      requestHeaders["X-Session-Token"] = session.token;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: payload,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson
    ? await response.json().catch(() => ({}))
    : await response.text();

  if (!response.ok) {
    const message =
      (isJson && (data?.error || data?.message)) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  signIn({ email, password }) {
    return request("/auth/sign_in", {
      method: "POST",
      body: { email, password },
    });
  },
  signUp({ email, password, name }) {
    return request("/auth/sign_up", {
      method: "POST",
      body: { email, password, name },
    });
  },
  me() {
    return request("/auth/me", { auth: true });
  },
};

export const winesApi = {
  list() {
    return request("/wines", { auth: true });
  },
  show(id) {
    return request(`/wines/${id}`);
  },
  create(wineData) {
    return request("/wines", {
      method: "POST",
      auth: true,
      body: { wine: wineData },
    });
  },
  update(id, wineData) {
    return request(`/wines/${id}`, {
      method: "PATCH",
      auth: true,
      body: { wine: wineData },
    });
  },
  destroy(id) {
    return request(`/wines/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};

export const wineProfilesApi = {
  list() {
    return request("/wine_profiles");
  },
  show(id) {
    return request(`/wine_profiles/${id}`);
  },
  search(query, limit = 10) {
    return request(
      `/wine_profiles/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    );
  },
};

export const userApi = {
  findUser(email) {
    return request(`/user/${email}`);
  },
};

export const tasteParametersApi = {
  list() {
    return request("/taste_parameters");
  },
};

export const reviewsApi = {
  list(wineSlug, vintageId) {
    return request(`/wines/${wineSlug}/vintages/${vintageId}/reviews`, {
      auth: true,
    });
  },
  show(id) {
    return request(`/reviews/${id}`, { auth: true });
  },
  create(wineSlug, vintageId, reviewData) {
    return request(`/wines/${wineSlug}/vintages/${vintageId}/reviews`, {
      method: "POST",
      auth: true,
      body: { review: reviewData },
    });
  },
  update(id, reviewData) {
    return request(`/reviews/${id}`, {
      method: "PATCH",
      auth: true,
      body: { review: reviewData },
    });
  },
  destroy(id) {
    return request(`/reviews/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};

export { API_BASE_URL };
