import { authClient } from "../auth";

export const useApi = () => {
  const apiFetch = async (path, options = {}) => {
    const { data } = await authClient.getSession();
    const token = data?.session?.token;

    alert(import.meta.env.VITE_API_URL);
    const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Session-Token": token ?? "",
        ...options.headers,
      },
      credentials: "include", // se usares cookies
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  return { apiFetch };
};
