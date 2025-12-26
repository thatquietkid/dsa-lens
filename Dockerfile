# ==========================================
# STAGE 1: Build the React Application
# ==========================================
# FIX: Changed 'as' to 'AS' to silence the warning
FROM node:22.16.0-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# ==========================================
# STAGE 2: Serve with Nginx
# ==========================================
FROM nginx:alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]