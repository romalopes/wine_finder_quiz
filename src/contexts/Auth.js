import { createAuthClient } from "@neondatabase/neon-js/auth";

const useFakeAuth = import.meta.env.VITE_USE_FAKE_AUTH; //import.meta.env.ENV;

const fakeAuthClient = {
  async getSession() {
    console.log(
      "import.meta.env.VITE_USE_FAKE_AUTH",
      import.meta.env.VITE_USE_FAKE_AUTH,
    );
    return {
      data: {
        session: {
          token: "fake-token",
        },
        user: {
          id: "local-user",
          email: "local@test.com",
          name: "Local User",
        },
      },
    };
  },

  async signIn() {
    return { error: null };
  },

  async signUp() {
    return { error: null };
  },

  async signOut() {
    return {};
  },
};

export const authClient =
  useFakeAuth === "true"
    ? fakeAuthClient
    : createAuthClient(import.meta.env.VITE_NEON_AUTH_URL);

// export const authClient = createAuthClient(import.meta.env.VITE_NEON_AUTH_URL);
