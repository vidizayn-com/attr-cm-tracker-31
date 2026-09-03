# ATTR-CM Tracker — Frontend

Amiloidoz (ATTR-CM) hasta takip ve yönetim sisteminin istemci tarafı.
Backend ayrı bir depodadır: `C:\projects\attr-cm-tracker-31-backend`
(https://github.com/vidizayn-com/attr-cm-tracker-31-backend). Bir özellik genelde
her iki depoda da değişiklik gerektirir — backend'i de kontrol et.

## Teknoloji

React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui, Radix UI, lucide-react.
`@/` alias'ı `src/`'ye çözümlenir (`vite.config.ts`).

## Komutlar

```bash
npm run dev      # Vite dev sunucusu, port 8080 (host 0.0.0.0)
npm run build    # Üretim derlemesi -> dist/
npm run lint     # ESLint
```

## API bağlantısı — dikkat

`src/lib/strapiClient.ts` içindeki `STRAPI_URL` çalışma anında çözümlenir ve
`src/lib/strapi.ts` bunu kullanır. Sıra:

1. `VITE_STRAPI_URL` env değişkeni (lokalde `.env` -> `http://localhost:1337`)
2. Env yoksa ve tarayıcıdaysak hostname'den türetilir:
   - `*-test` içeren host -> `-test` yerine `-api-test`
     (örn. `attr-cm-tracker-test.vidizayn.com` -> `attr-cm-tracker-api-test.vidizayn.com`)
   - `attrnavigator.com` / `*.attrnavigator.com` -> `api.attrnavigator.com`
   - diğer `*.vidizayn.com` -> `*-api.vidizayn.com`
3. localhost'ta env yoksa -> `http://127.0.0.1:1337`

Bu mantık `strapiClient.ts` ve `strapi.ts` içinde **iki kez** tekrarlanıyor.
Domain kuralını değiştirirsen ikisini birlikte güncelle.

Auth token'ı `localStorage`'da: hekim için `doctor_token`, yönetici için `admin_token`.

## Ekran -> backend action eşlemesi

Backend'de tüm iş mantığı tek controller'da: `src/api/doctor/controllers/auth.ts`.

| Ekran | Dosya | Backend action |
|---|---|---|
| Hekim girişi | `src/pages/Login.tsx` | `auth.loginInit`, `auth.loginVerify` |
| Yönetici girişi | `src/pages/AdminLogin.tsx` | `auth.adminLogin` |
| Dashboard | `src/pages/Dashboard.tsx` | `auth.expiringMedication`, `auth.diagnosisPatients`, `auth.recentReports`, `auth.dashboardStats` |
| Hasta listesi + Excel export | `src/pages/PatientList.tsx` | `auth.myPatients`, `auth.exportPatients` |
| Hasta kayıt | `src/pages/PatientRegistration.tsx` | `auth.registerPatient` |
| Hasta detay | `src/pages/PatientDetails.tsx` | `auth.patientDetail`, `auth.getClinicalData` |
| Hasta havuzu | `src/pages/PatientPool.tsx` | `auth.poolPatients`, `auth.assignToMe` |
| Yönetici paneli | `src/pages/AdminDashboard.tsx` | `auth.adminDashboard`, `auth.adminGetInvitations` |

`src/lib/` içeriği: `strapiClient.ts` (düşük seviye fetch + hata mesajı çevirisi),
`strapi.ts` (`fetchFromStrapi`), `strapiPatients.ts`, `patientApi.ts`,
`patientSchema.ts`, `pdfGenerator.ts`.

## Dallar ve deploy

- `test` — aktif geliştirme dalı, buradan başla ve buraya dön
- `master` — canlı yayın

Standart akış (backend deposunda da aynısı):

```bash
git add . && git commit -m "fix: aciklama" && git push origin test
git checkout master && git merge test --no-edit && git push origin master && git checkout test
```

Canlı test: https://attr-cm-tracker-test.vidizayn.com

## KVKK

Hasta verisi kişisel sağlık verisidir. Export ve listeleme ekranlarında demografik
alanlar (ad, soyad, telefon, e-posta, adres) maskelenir. Yeni bir ekran veya export
eklerken maskeleme kuralını koru; log'a ham hasta verisi yazma.
