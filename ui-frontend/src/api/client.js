const BASE_URL = "/odata/v4/sales";

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error(`GET failed: ${res.status}`);
  return res.json();
}

export async function apiPost(path, data = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${txt}`);
  }

  try {
    return await res.json();
  } catch {
    return {};
  }
}
