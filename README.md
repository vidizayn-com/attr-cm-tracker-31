# ATTR-CM Patient Tracker — Frontend

## Description
ATTR-CM (Transthyretin Amyloid Cardiomyopathy) hasta takip sistemi frontend uygulaması. Kardiyologlar, hematoloji, nükleer tıp ve genetik uzmanlarını multidisipliner bir teşhis akışında birleştiren tıbbi uygulama.

## Technology Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **UI**: shadcn/ui + Tailwind CSS
- **State/Data**: TanStack React Query
- **Routing**: React Router DOM v6
- **Charts**: Recharts
- **Notifications**: Sonner

## Environment Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `VITE_STRAPI_URL` | Backend Strapi API URL | Yes | `http://localhost:1337` | `https://api.attr-tracker.example.com` |

## Local Development

### Prerequisites
- Node.js 20+
- npm 6+

### Installation
```bash
# Clone repository
git clone <repo-url>
cd attr-cm-tracker-31

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your backend URL

# Start development server
npm run dev
```

Application will be available at `http://localhost:8080`

### Build
```bash
npm run build
```

## Docker

### Build and run locally
```bash
docker build -t attr-cm-tracker-31 .
docker run -p 80:80 attr-cm-tracker-31
```

### With backend (docker-compose)
See the root `docker-compose.yml` for the full-stack setup.

## Production Deployment

### Architecture
- **Containerized** with Nginx serving the SPA
- Deployed on **AWS EKS** via Helm charts
- CI/CD via **AWS CodeBuild** (see `buildspec.yml`)

### Branches
| Branch | Environment |
|--------|-------------|
| `test` | Test |
| `master` | Production |

### Config Repository
Helm charts are in the separate `attr-cm-tracker-31-config` repository.

## Health Check
Nginx serves a health check endpoint at `GET /health` returning `{"status":"ok"}`.

## Key Features
- 🔐 Doctor authentication (phone + password / OTP)
- 👥 Patient registration and management
- 📊 Clinical measurement tracking with charts
- 🏥 Patient pool management by institution
- 📝 Specialist notes with file attachments
- 📈 Admin dashboard with analytics
- 🔔 Deadline notification system
