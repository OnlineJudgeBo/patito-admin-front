FROM node:20 as builder

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

ARG VITE_API_URL=http://localhost:5043/api
ARG VITE_SITE_ID=1
ARG VITE_REACT_APP_AUTH_REDIRECT_URL=http://localhost:3000/
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_SITE_ID=${VITE_SITE_ID} \
    VITE_REACT_APP_AUTH_REDIRECT_URL=${VITE_REACT_APP_AUTH_REDIRECT_URL}

RUN npm run build

FROM starsaminf/angular-react-configs-nginx

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
