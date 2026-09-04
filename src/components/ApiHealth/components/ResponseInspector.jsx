import { useEffect, useRef, useState } from "react";
import styles from "../ApiHealth.module.css";

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for non-secure contexts (e.g. plain http on LAN).
  return new Promise((resolve, reject) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy") ? resolve() : reject(new Error("copy failed"));
    } catch (err) {
      reject(err);
    } finally {
      document.body.removeChild(textarea);
    }
  });
}

function JsonBlock({ label, data, copyable = false }) {
  let text;
  try {
    text = JSON.stringify(data, null, 2);
  } catch {
    text = String(data);
  }

  const [copyState, setCopyState] = useState("idle"); // idle | copied | failed
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function handleCopy() {
    copyText(text)
      .then(() => setCopyState("copied"))
      .catch(() => setCopyState("failed"))
      .finally(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopyState("idle"), 1500);
      });
  }

  return (
    <div className={styles.inspectorSection}>
      {copyable ? (
        <div className={styles.inspectorHeader}>
          <div className={styles.inspectorLabel}>{label}</div>
          <button
            type="button"
            className={`${styles.copyBtn}${
              copyState === "copied" ? ` ${styles.copyBtnCopied}` : ""
            }`}
            onClick={handleCopy}
          >
            {copyState === "copied" ? "Copied ✓" : copyState === "failed" ? "Failed" : "Copy"}
          </button>
        </div>
      ) : (
        <div className={styles.inspectorLabel}>{label}</div>
      )}
      <pre className={styles.inspectorCode}>
        <code>{text}</code>
      </pre>
    </div>
  );
}

export default function ResponseInspector({ check, result }) {
  if (!check || !result) return null;

  const headers = result.requestHeaders || {};

  return (
    <div className={styles.inspector}>
      <JsonBlock label="Target Request" data={{ method: check.method, url: check.url }} />
      <JsonBlock label="Request Headers" data={headers} />
      <JsonBlock label="Response Meta" data={{ status: result.status, expectedStatus: result.expectedStatus }} />
      {result.error && (
        <JsonBlock label="Error" data={{ error: result.error, retried: result.retried }} />
      )}
      <JsonBlock label="Response Payload" data={result.payload ?? null} copyable />
    </div>
  );
}