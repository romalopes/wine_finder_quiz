const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const TOKEN_STORAGE_KEY = "wine_prediction_token";

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }
}

// Restore any previously stored token at module load.
if (typeof window !== "undefined") {
  authToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

async function request(
  path,
  { method = "GET", body, auth = false, headers = {} } = {},
) {
  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  let payload;
  if (body instanceof FormData) {
    // Let the browser set the multipart Content-Type boundary.
    payload = body;
  } else if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (auth && authToken) {
    requestHeaders.Authorization = `Bearer ${authToken}`;
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
      (Array.isArray(data?.errors) && data.errors.join(", ")) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  // Surface the JWT issued by devise-jwt (sent in the Authorization header
  // on sign-in / sign-up responses).
  const authorizationHeader = response.headers.get("Authorization");
  if (authorizationHeader) {
    data.token = authorizationHeader.replace(/^Bearer\s+/i, "");
  }

  return data;
}

export const authApi = {
  signIn({ email, password }) {
    return request("/auth/sign_in", {
      method: "POST",
      body: { user: { email, password } },
    });
  },
  signUp({ email, password, name }) {
    return request("/auth/sign_up", {
      method: "POST",
      body: {
        user: { name, email, password, password_confirmation: password },
      },
    });
  },
  signOut() {
    return request("/auth/sign_out", { method: "DELETE", auth: true });
  },
  me() {
    return request("/me", { auth: true });
  },
};

export const imagesApi = {
  upload(imageableType, imageableId, files) {
    const formData = new FormData();
    formData.append("imageable_type", imageableType);
    formData.append("imageable_id", imageableId);
    Array.from(files).forEach((file) => formData.append("images[]", file));
    return request("/images", {
      method: "POST",
      auth: true,
      body: formData,
    });
  },
  destroy(imageableType, imageableId, imageId) {
    return request(`/images/${imageId}?imageable_type=${imageableType}&imageable_id=${imageableId}`, {
      method: "DELETE",
      auth: true,
    });
  },
};

export const winesApi = {
  list() {
    return request("/wines", { auth: false });
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

export const producersApi = {
  list() {
    return request("/producers");
  },
  show(id) {
    return request(`/producers/${id}`);
  },
  create(producerData) {
    return request("/producers", {
      method: "POST",
      auth: true,
      body: { producer: producerData },
    });
  },
  update(id, producerData) {
    return request(`/producers/${id}`, {
      method: "PATCH",
      auth: true,
      body: { producer: producerData },
    });
  },
  destroy(id) {
    return request(`/producers/${id}`, {
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
  all() {
    return request("/reviews", { auth: true });
  },
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
  myReviews() {
    return request("/reviews/my_reviews", { auth: true });
  },
};

export const articlesApi = {
  list() {
    return request("/articles", { auth: true });
  },
  show(id) {
    return request(`/articles/${id}`, { auth: true });
  },
  create(articleData) {
    return request("/articles", {
      method: "POST",
      auth: true,
      body: { article: articleData },
    });
  },
  update(id, articleData) {
    return request(`/articles/${id}`, {
      method: "PATCH",
      auth: true,
      body: { article: articleData },
    });
  },
  destroy(id) {
    return request(`/articles/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};

export const categoriesApi = {
  list() {
    return request("/categories");
  },
};

export { API_BASE_URL };
