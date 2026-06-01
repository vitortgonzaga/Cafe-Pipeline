FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=optional \
  && npm install --no-save \
    lightningcss-linux-x64-gnu@1.32.0 \
    @cloudflare/workerd-linux-64@1.20260515.1

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
