# Stage 1: Build frontend
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

# Timezone Configuration
ENV TZ=Europe/Istanbul
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# Build-time argument for API URL
ARG VITE_STRAPI_URL
ENV VITE_STRAPI_URL=${VITE_STRAPI_URL}

RUN npm run build

# Stage 2: Serve with Nginx
FROM public.ecr.aws/docker/library/nginx:alpine

# Timezone Configuration
ENV TZ=Europe/Istanbul
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone

# Copy built frontend
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
