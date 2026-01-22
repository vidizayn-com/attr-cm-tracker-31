const RAW = import.meta.env.VITE_STRAPI_URL;

if (!RAW) throw new Error("VITE_STRAPI_URL is not set.");

const STRAPI_BASE = RAW.replace(/\/api\/?$/, ""); // ✅ eğer /api ile bitiyorsa kırpar
const API_BASE = `${STRAPI_BASE}/api`;


async function strapiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(`Strapi request failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

function isNumericId(v: string) {
  return /^\d+$/.test(v);
}

/**
 * idOrDocId: route'tan gelen değer (numeric id de olabilir, documentId de)
 * return: normalize edilmiş hasta objesi (attributes varsa flatten eder)
 */
export async function fetchPatientByAnyId(idOrDocId: string) {
  // 1) numeric id ise /patients/:id
  if (isNumericId(idOrDocId)) {
    const direct = await strapiGet(`/patients/${idOrDocId}?populate=*`);
    const data = direct?.data ?? null;
    if (!data) return null;

    // Strapi v4: { id, attributes }
    return data.attributes ? { id: data.id, ...data.attributes } : data;
  }

  // 2) documentId ise filtre ile ara
  const filtered = await strapiGet(
    `/patients?filters[documentId][$eq]=${encodeURIComponent(idOrDocId)}&populate=*`
  );

  const data = filtered?.data?.[0] ?? null;
  if (!data) return null;

  return data.attributes ? { id: data.id, ...data.attributes } : data;
}
