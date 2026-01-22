export async function testFetchInstitutions() {
  const base = import.meta.env.VITE_STRAPI_URL;

  if (!base) {
    console.error("VITE_STRAPI_URL is missing. Check .env.local");
    return;
  }

  const res = await fetch(`${base}/api/institutions`);
  const json = await res.json();
  console.log("institutions:", json);
  return json;
}

export async function testFetchPatients() {
  const base = import.meta.env.VITE_STRAPI_URL;

  if (!base) {
    console.error("VITE_STRAPI_URL is missing. Check .env.local");
    return;
  }

  const res = await fetch(`${base}/api/patients?populate=*`);
  const json = await res.json();
  console.log("patients:", json);
  return json;
}
