import styles from "../ApiHealth.module.css";

function JsonBlock({ label, data }) {
  let text;
  try {
    text = JSON.stringify(data, null, 2);
  } catch {
    text = String(data);
  }
  return (
    <div className={styles.inspectorSection}>
      <div className={styles.inspectorLabel}>{label}</div>
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
      <JsonBlock label="Response Payload" data={result.payload ?? null} />
    </div>
  );
}