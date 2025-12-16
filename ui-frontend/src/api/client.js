// src/api/client.js

/**
 * API CLIENT – SAP CAP (OData v4)
 * =========================================================
 * ✔ Works with cds watch (local + BAS)
 * ✔ Works with authenticated BAS preview URLs
 * ✔ Uses cookies (dummy auth / BAS auth)
 * ✔ No hardcoded ports
 *
 * IMPORTANT:
 * - BASE_URL must be empty so proxy / same-origin works
 * =========================================================
 */

const BASE_URL = "";

/* =========================================================
   GENERIC API HELPERS
========================================================= */

/**
 * GET request (OData-safe)
 */
export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json"
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "GET request failed");
  }

  return res.json();
}

/**
 * POST request (CAP Action-safe)
 */
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
    const text = await res.text();
    throw new Error(text || "POST request failed");
  }

  return res.json();
}
