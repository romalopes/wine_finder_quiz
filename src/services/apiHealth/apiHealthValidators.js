// Pure payload-verification helpers used by the API health checks.
// Kept dependency-free so they can be unit-tested and reused by the
// CI smoke-test script.

export const isNonEmptyArray = (data) =>
  Array.isArray(data) && data.length > 0;

export const isValidArray = (data) => Array.isArray(data);

export const isHealthyDetailedPayload = (data) =>
  data?.status === "ok" && data?.database === "ok";

export const isAuthMePayload = (data) =>
  Boolean(data?.user?.id) && Boolean(data?.user?.email);

export const isProducerPayload = (data) =>
  Boolean(data?.id) && Boolean(data?.slug) && Boolean(data?.name);

export const hasStatusOk = (data) => data?.status === "ok";