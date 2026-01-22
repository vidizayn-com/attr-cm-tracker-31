import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { testFetchInstitutions, testFetchPatients } from "./strapiTest";

console.log("VITE_STRAPI_URL:", import.meta.env.VITE_STRAPI_URL);
testFetchInstitutions();
testFetchPatients();

createRoot(document.getElementById("root")!).render(<App />);
