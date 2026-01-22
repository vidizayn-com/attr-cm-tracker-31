const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

if (!STRAPI_URL) {
  // Bu hata dev ortamında hemen yakalansın
  console.error("VITE_STRAPI_URL is missing. Check .env.local");
}

type StrapiCreateResponse<T> = {
  data: T;
};

export async function strapiPost<T = any>(path: string, body: any): Promise<T> {
  if (!STRAPI_URL) throw new Error("VITE_STRAPI_URL is missing");

  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Strapi POST failed: ${res.status} ${text}`);
  }

  const json: StrapiCreateResponse<T> = await res.json();
  return json.data;
}

export async function strapiPut<T = any>(path: string, body: any): Promise<T> {
  if (!STRAPI_URL) throw new Error("VITE_STRAPI_URL is missing");

  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Strapi PUT failed: ${res.status} ${text}`);
  }

  const json: StrapiCreateResponse<T> = await res.json();
  return json.data;
}
