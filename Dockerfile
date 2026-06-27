FROM node:20 as builder

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

ARG VITE_API_URL=http://localhost:8088/api
ARG VITE_SITE_ID=1
ARG VITE_LOGOUT_URL=http://localhost:8082/oj/logout.php
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_SITE_ID=${VITE_SITE_ID} \
    VITE_LOGOUT_URL=${VITE_LOGOUT_URL}

RUN npm run build

FROM starsaminf/angular-react-configs-nginx

COPY --from=builder /app/dist /usr/share/nginx/html/admin
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
