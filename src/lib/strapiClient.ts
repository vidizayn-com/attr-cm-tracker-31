const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

if (!STRAPI_URL) {
  console.error("VITE_STRAPI_URL is missing. Check .env.local");
}

type StrapiCreateResponse<T> = {
  data: T;
};

// Helper to get headers with Auth token
const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("doctor_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export async function strapiPost<T = any>(path: string, body: any): Promise<T> {
  if (!STRAPI_URL) throw new Error("VITE_STRAPI_URL is missing");

  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Strapi POST failed: ${res.status} ${text}`);
  }

  // Handle cases where response might not be JSON or wrapped in data
  let json;
  try {
    json = await res.json();
  } catch (e) {
    return {} as T;
  }

  return json.data || json; // Support both { data: ... } and direct object
}

export async function strapiPut<T = any>(path: string, body: any): Promise<T> {
  if (!STRAPI_URL) throw new Error("VITE_STRAPI_URL is missing");

  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Strapi PUT failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.data || json;
}

export async function strapiGet<T = any>(path: string): Promise<T> {
  if (!STRAPI_URL) throw new Error("VITE_STRAPI_URL is missing");

  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Strapi GET failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.data || json;
}

