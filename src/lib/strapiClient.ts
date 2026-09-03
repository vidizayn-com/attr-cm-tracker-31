export let STRAPI_URL = import.meta.env.VITE_STRAPI_URL;
if (!STRAPI_URL) {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    let host = window.location.hostname;
    if (host.includes('-test')) {
      host = host.replace('-test', '-api-test');
    } else if (host === 'attrnavigator.com' || host.endsWith('.attrnavigator.com')) {
      host = 'api.attrnavigator.com';
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
  const token = localStorage.getItem("doctor_token") || localStorage.getItem("admin_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export function parseStrapiErrorMessage(text: string, status: number): string {
  if (!text) return `İşlem başarısız oldu (${status})`;
  if (typeof text === 'string' && (text.includes("Failed to fetch") || text.includes("TypeError") || text.includes("NetworkError"))) {
    return "Sunucuya bağlanılamadı. Lütfen internet bağlantınızı ve sunucunun erişilebilirliğini kontrol edin.";
  }
  try {
    const json = typeof text === 'string' ? JSON.parse(text) : text;
    let msg = json?.error?.message || json?.message || (typeof json?.error === 'string' ? json.error : null);
    
    if (typeof msg === 'string' && msg.trim()) {
      const clean = msg.trim();
      if (clean.includes("already exists") || clean.includes("already has this email")) {
        return "Bu e-posta adresine sahip bir hekim veya hasta zaten sistemde kayıtlı.";
      }
      if (clean.includes("already has this phone")) {
        return "Bu telefon numarasına sahip bir hekim veya hasta zaten sistemde kayıtlı.";
      }
      if (clean.includes("Failed to fetch")) {
        return "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
      }
      return clean;
    }
  } catch (e) {
    // text is not JSON
  }

  // If text contains JSON or error string, extract or return clean Turkish message
  if (typeof text === 'string') {
    if (text.includes("already exists") || text.includes("already has this email")) {
      return "Bu e-posta adresine sahip bir hekim veya hasta zaten sistemde kayıtlı.";
    }
    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
      return "İşlem gerçekleştirilemedi. Lütfen girilen bilgileri kontrol edin.";
    }
  }

  return text;
}

export async function strapiPost<T = any>(path: string, body: any): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${STRAPI_URL}${path}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
  } catch (netErr: any) {
    console.error(`[strapiPost Network Error] POST ${path}:`, netErr);
    throw new Error("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı ve sunucunun erişilebilirliğini kontrol edin.");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(parseStrapiErrorMessage(text, res.status));
  }

  let json;
  try {
    json = await res.json();
  } catch (e) {
    return {} as T;
  }

  return json.data || json;
}

export async function strapiPut<T = any>(path: string, body: any): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${STRAPI_URL}${path}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
  } catch (netErr: any) {
    console.error(`[strapiPut Network Error] PUT ${path}:`, netErr);
    throw new Error("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı ve sunucunun erişilebilirliğini kontrol edin.");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(parseStrapiErrorMessage(text, res.status));
  }

  const json = await res.json();
  return json.data || json;
}

export async function strapiGet<T = any>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${STRAPI_URL}${path}`, {
      method: "GET",
      headers: getHeaders(),
    });
  } catch (netErr: any) {
    console.error(`[strapiGet Network Error] GET ${path}:`, netErr);
    throw new Error("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı ve sunucunun erişilebilirliğini kontrol edin.");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(parseStrapiErrorMessage(text, res.status));
  }

  const json = await res.json();
  return json.data || json;
}

