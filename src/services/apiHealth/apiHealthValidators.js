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

export const isSubscriptionListPayload = (data) =>
  Array.isArray(data) &&
  data.every(
    (s) =>
      Boolean(s?.id) &&
      Boolean(s?.name) &&
      Array.isArray(s?.features),
  );

// Validates the subscription FEATURE catalogue itself, not just the list:
//  - every feature has a numeric id and a non-empty name
//  - no duplicate features within a plan
//  - free plans ship without features, paid plans expose at least one
export const areSubscriptionFeaturesValid = (data) => {
  if (!Array.isArray(data) || data.length === 0) return false;

  return data.every((plan) => {
    const features = plan?.features;
    if (!Array.isArray(features)) return false;

    const ids = new Set();
    for (const feature of features) {
      if (!Number.isInteger(feature?.id)) return false;
      if (typeof feature?.name !== "string" || feature.name.trim() === "") return false;
      if (ids.has(feature.id)) return false;
      ids.add(feature.id);
    }

    const isFree =
      (!plan?.monthly_price_cents || plan.monthly_price_cents === 0) &&
      (!plan?.yearly_price_cents || plan.yearly_price_cents === 0);

    return isFree ? features.length === 0 : features.length > 0;
  });
};

export const hasStatusOk = (data) => data?.status === "ok";