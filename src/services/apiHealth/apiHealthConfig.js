import { VERSION_BACK_END } from "../../constants/versions.js";
import {
  isValidArray,
  isHealthyDetailedPayload,
  isAuthMePayload,
  isProducerPayload,
  isSubscriptionListPayload,
  hasStatusOk,
} from "./apiHealthValidators.js";

export const API_CATEGORIES = {
  SYSTEM: "System",
  AUTH: "Authentication",
  SECURITY: "Security Guards",
  REFERENCE: "Reference Data",
  PRODUCERS: "Producers",
  WINES: "Wines",
  SUBSCRIPTIONS: "Subscriptions",
  WRITE_SANDBOX: "Write Operations (Manual)",
};

export const DEFAULT_THRESHOLDS = {
  excellent: 200,
  good: 500,
  slow: 1000,
};

export const API_CHECKS = [
  {
    id: "system-liveness",
    category: API_CATEGORIES.SYSTEM,
    name: "Public Liveness Check",
    method: "GET",
    url: "/health",
    expectedStatus: 200,
    requiresAuth: false,
    validate: hasStatusOk,
  },
  {
    id: "system-detailed",
    category: API_CATEGORIES.SYSTEM,
    name: "Detailed Infrastructure Health",
    method: "GET",
    url: "/health/detailed",
    expectedStatus: 200,
    requiresAuth: true,
    validate: isHealthyDetailedPayload,
  },
  {
    id: "system-version-match",
    category: API_CATEGORIES.SYSTEM,
    name: "Backend Version Matches Frontend Constant",
    method: "GET",
    url: "/health/detailed",
    expectedStatus: 200,
    requiresAuth: true,
    // Compare the version reported by the Rails API (VERSION file) against
    // the VERSION_BACK_END constant expected by the frontend.
    validate: (data) => data?.version === VERSION_BACK_END,
    describeFailure: (data) =>
      `Backend version "${data?.version ?? "unknown"}" does not match frontend VERSION_BACK_END "${VERSION_BACK_END}"`,
  },
  {
    id: "auth-me-valid",
    category: API_CATEGORIES.AUTH,
    name: "Authenticated Session Context",
    method: "GET",
    url: "/me",
    expectedStatus: 200,
    requiresAuth: true,
    validate: isAuthMePayload,
  },
  {
    id: "auth-me-rejected",
    category: API_CATEGORIES.SECURITY,
    name: "Unauthenticated Request Rejection",
    method: "GET",
    url: "/me",
    expectedStatus: 401,
    requiresAuth: false, // Intentionally exclude the auth header.
    validate: () => true,
  },
  {
    id: "ref-countries",
    category: API_CATEGORIES.REFERENCE,
    name: "Countries List",
    method: "GET",
    url: "/countries",
    expectedStatus: 200,
    requiresAuth: false,
    validate: isValidArray,
  },
  {
    id: "ref-regions",
    category: API_CATEGORIES.REFERENCE,
    name: "Regions List",
    method: "GET",
    url: "/regions",
    expectedStatus: 200,
    requiresAuth: false,
    validate: isValidArray,
  },
  {
    id: "ref-grapes",
    category: API_CATEGORIES.REFERENCE,
    name: "Grapes List",
    method: "GET",
    url: "/grapes",
    expectedStatus: 200,
    requiresAuth: false,
    validate: isValidArray,
  },
  {
    id: "producers-list",
    category: API_CATEGORIES.PRODUCERS,
    name: "List Producers",
    method: "GET",
    url: "/producers",
    expectedStatus: 200,
    requiresAuth: false,
    latencyThresholds: { excellent: 300, good: 700, slow: 1500 },
    validate: isValidArray,
  },
  {
    id: "wines-list",
    category: API_CATEGORIES.WINES,
    name: "List Wines",
    method: "GET",
    url: "/wines",
    expectedStatus: 200,
    requiresAuth: false,
    latencyThresholds: { excellent: 300, good: 700, slow: 1500 },
    validate: isValidArray,
  },
  {
    id: "subscriptions-list",
    category: API_CATEGORIES.SUBSCRIPTIONS,
    name: "List Subscriptions (Public Plans)",
    method: "GET",
    url: "/subscriptions",
    expectedStatus: 200,
    requiresAuth: false,
    validate: isSubscriptionListPayload,
  },
  {
    id: "subscriptions-features",
    category: API_CATEGORIES.SUBSCRIPTIONS,
    name: "Subscription Plans Expose Features",
    method: "GET",
    url: "/subscriptions",
    expectedStatus: 200,
    requiresAuth: false,
    validate: (data) =>
      Array.isArray(data) && data.some((s) => (s.features || []).length > 0),
    describeFailure: () =>
      "No subscription plan returned a non-empty feature list",
  },
  // --- Write sandbox (manual trigger only, excluded from "Run All") ---
  {
    id: "write-producer-create-delete",
    category: API_CATEGORIES.WRITE_SANDBOX,
    name: "Create + Delete a Temporary Producer",
    method: "POST",
    url: "/producers",
    expectedStatus: 201,
    requiresAuth: true,
    requiresManualTrigger: true,
    description:
      "Creates a temporary producer (name suffixed with a timestamp) then deletes it. Self-cleaning.",
    validate: isProducerPayload,
  },
];

// A tiny helper to keep the config self-documenting.
export const isWriteCheck = (check) =>
  check.requiresManualTrigger === true ||
  check.category === API_CATEGORIES.WRITE_SANDBOX;

export const getCheckById = (id) => API_CHECKS.find((c) => c.id === id);