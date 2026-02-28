FROM node:20-alpine AS build

WORKDIR /app

# Copy all package files first so postinstall can find them
COPY package.json package-lock.json* ./
COPY server/package.json server/package-lock.json* ./server/
COPY client/package.json client/package-lock.json* ./client/

# Install all dependencies (root postinstall handles server + client)
RUN npm install

# Copy source and build
COPY server/ ./server/
RUN cd server && npm run build

COPY client/ ./client/
RUN cd client && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/server/package.json /app/server/package-lock.json* ./server/

WORKDIR /app/server
RUN npm install --omit=dev
WORKDIR /app

COPY --from=build /app/server/dist/ ./server/dist/
COPY --from=build /app/server/src/migrations/ ./server/src/migrations/
COPY --from=build /app/client/dist/ ./client/dist/

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server/dist/index.js"]
