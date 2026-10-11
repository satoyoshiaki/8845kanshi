FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
ENV FRONTEND_PORT=3000 BACKEND_PORT=8000
COPY nginx.conf /etc/nginx/templates/dashboard.conf.template
COPY docker-entrypoint-dashboard.sh /usr/local/bin/docker-entrypoint-dashboard
COPY --from=build /app/dist /usr/share/nginx/html
RUN chmod +x /usr/local/bin/docker-entrypoint-dashboard
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint-dashboard"]
CMD ["nginx", "-g", "daemon off;"]
