FROM node:22-slim

WORKDIR /app

COPY clipcraft-web/package*.json ./
RUN npm ci

COPY clipcraft-web ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
