export let STRAPI_URL = import.meta.env.VITE_STRAPI_URL;
if (STRAPI_URL === undefined) {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    let host = window.location.hostname;
    if (host.includes('-test')) {
      host = host.replace('-test', '-api-test');
    } else {
      host = host.replace('.vidizayn.com', '-api.vidizayn.com');
    }
    STRAPI_URL = `https://${host}`;
  } else {
    STRAPI_URL = 'http://127.0.0.1:1337';
  }
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

