FROM node:22.15.0-slim

WORKDIR /app

EXPOSE 5173

RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

CMD ["sh", "-c", "pnpm install && pnpm run dev"]