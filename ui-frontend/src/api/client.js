// src/api/client.js

/**
 * API CLIENT – SAP CAP (OData v4)
 * =========================================================
 * ✔ Works in SAP BAS Preview (port forwarding)
 * ✔ Works in local development
 * ✔ Avoids mixed-content (https → http) issues
 * ✔ Zero environment variables required
 * =========================================================
 */

function getCapBaseUrl() {
  const { protocol, host } = window.location;

  /**
   * SAP BAS Preview pattern:
   * UI  -> https://port3002-<workspace>.applicationstudio.cloud.sap
   * CAP -> https://port4004-<workspace>.applicationstudio.cloud.sap
   */
  if (host.startsWith("port3002-")) {
    return `${protocol}//${host.replace(
      "port3002-",
      "port4004-"
    )}/odata/v4/sales`;
  }

  /**
   * Direct backend preview (optional safety)
   * If someone opens the backend URL directly
   */
  if (host.startsWith("port4004-")) {
    return `${protocol}//${host}/odata/v4/sales`;
  }

  /**
   * Local development fallback
   */
  return "http://localhost:4004/odata/v4/sales";
}

const BASE_URL = getCapBaseUrl();

/* =========================================================
   API HELPERS
========================================================= */

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json"
    }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `GET failed (${res.status})`);
  }

  return res.json();
}

export async function apiPost(path, body = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `POST failed (${res.status})`);
  }

  return res.json();
}
