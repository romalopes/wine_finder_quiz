import { DEFAULT_THRESHOLDS } from "./apiHealthConfig.js";
import { API_BASE_URL } from "../api.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Whether an error is worth a single retry (network drop or timeout).
function isRetryableError(err) {
  if (!err) return false;
  if (err.name === "AbortError") return true;
  if (err instanceof TypeError) return true; // "Failed to fetch" (network/CORS/DNS)
  return false;
}

function classifyError(err) {
  if (err?.name === "AbortError") return "Timeout";
  if (err instanceof TypeError) return "Network / CORS / DNS Unreachable";
  return err?.message || String(err);
}

// Convert a latency measurement (ms) into a human rating.
export function rateLatency(latencyMs, thresholds = DEFAULT_THRESHOLDS) {
  if (latencyMs <= thresholds.excellent) return "excellent";
  if (latencyMs <= thresholds.good) return "good";
  if (latencyMs <= thresholds.slow) return "slow";
  return "very_slow";
}

// Redact sensitive header values for display/logging.
function redactHeaders(headers) {
  const out = {};
  Object.entries(headers || {}).forEach(([key, value]) => {
    if (/authorization/i.test(key)) {
      out[key] = "Bearer [REDACTED]";
    } else {
      out[key] = value;
    }
  });
  return out;
}

// Perform a single HTTP request for a check, with timeout + one retry.
async function attemptRequest(check, { getAuthToken, timeoutMs }) {
  const timeout = check.timeoutMs || timeoutMs || 5000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const headers = { Accept: "application/json" };
  if (check.requiresAuth && getAuthToken) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${check.url}`, {
      method: check.method,
      headers,
      signal: controller.signal,
    });
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson
      ? await response.json().catch(() => ({}))
      : await response.text();
    return { response, payload, headers };
  } finally {
    clearTimeout(timer);
  }
}

// Execute a single check and return the standardized result object.
export async function runCheck(check, { getAuthToken, timeoutMs } = {}) {
  const start = performance.now();
  let result = null;
  let error = null;
  let retried = false;

  try {
    result = await attemptRequest(check, { getAuthToken, timeoutMs });
  } catch (err) {
    error = err;
    if (isRetryableError(err)) {
      await sleep(300);
      retried = true;
      try {
        result = await attemptRequest(check, { getAuthToken, timeoutMs });
        error = null;
      } catch (err2) {
        error = err2;
      }
    }
  }

  const latencyMs = Math.round(performance.now() - start);
  const status = result?.response?.status ?? null;
  const payload = result?.payload ?? null;

  let passed = false;
  let validationError = null;
  if (result && status === check.expectedStatus) {
    try {
      passed = check.validate ? check.validate(payload) : true;
      if (!passed) {
        validationError =
          (typeof check.describeFailure === "function" &&
            check.describeFailure(payload)) ||
          "Payload validation failed";
      }
    } catch (e) {
      passed = false;
      validationError = `Validation threw: ${e.message}`;
    }
  } else if (result) {
    validationError = `Expected status ${check.expectedStatus}, got ${status}`;
  }

  return {
    id: check.id,
    name: check.name,
    category: check.category,
    passed,
    status,
    expectedStatus: check.expectedStatus,
    latencyMs,
    latencyRating: rateLatency(
      latencyMs,
      check.latencyThresholds || DEFAULT_THRESHOLDS,
    ),
    payload,
    requestHeaders: redactHeaders(result?.headers || {}),
    error: error ? classifyError(error) : validationError,
    retried,
  };
}

// Write-sandbox flow: create a temporary producer, then delete it.
// Returns a result object describing the whole flow.
export async function runWriteFlow(check, { getAuthToken, timeoutMs } = {}) {
  const start = performance.now();
  const timeout = check.timeoutMs || timeoutMs || 5000;
  const suffix = Date.now();
  const producerName = `Health Check Temp ${suffix}`;
  const createBody = JSON.stringify({
    producer: {
      name: producerName,
      email: `health-check-${suffix}@winewords.com.au`,
    },
  });

  const headers = { Accept: "application/json", "Content-Type": "application/json" };
  if (getAuthToken) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let createdId = null;
  let createStatus = null;
  let error = null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const createRes = await fetch(`${API_BASE_URL}${check.url}`, {
      method: "POST",
      headers,
      body: createBody,
      signal: controller.signal,
    });
    createStatus = createRes.status;
    const createPayload = await createRes.json().catch(() => ({}));
    createdId = createPayload?.id ?? null;

    if (createRes.status === 201 && createdId) {
      // Clean up: delete the temporary producer.
      const deleteRes = await fetch(`${API_BASE_URL}${check.url}/${createdId}`, {
        method: "DELETE",
        headers,
        signal: controller.signal,
      });
      if (deleteRes.status !== 204) {
        error = `Cleanup DELETE returned ${deleteRes.status}`;
      }
    } else {
      error = `Create returned ${createRes.status}`;
    }
  } catch (err) {
    error = classifyError(err);
  } finally {
    clearTimeout(timer);
  }

  const latencyMs = Math.round(performance.now() - start);
  const passed = !error && createStatus === 201;

  return {
    id: check.id,
    name: check.name,
    category: check.category,
    passed,
    status: createStatus,
    expectedStatus: 201,
    latencyMs,
    latencyRating: rateLatency(latencyMs, check.latencyThresholds),
    payload: { createdProducerId: createdId, tempName: producerName },
    requestHeaders: redactHeaders(headers),
    error,
    retried: false,
  };
}