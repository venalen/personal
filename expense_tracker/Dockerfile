FROM node:20-alpine AS build

WORKDIR /app

# Install root dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Install and build server
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm install

COPY server/ ./server/
RUN cd server && npm run build

# Install and build client
COPY client/package.json client/package-lock.json* ./client/
RUN cd client && npm install

COPY client/ ./client/
RUN cd client && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/server/package.json /app/server/package-lock.json* ./server/
RUN cd server && npm install --omit=dev

COPY --from=build /app/server/dist/ ./server/dist/
COPY --from=build /app/server/src/schema.sql ./server/src/schema.sql
COPY --from=build /app/client/dist/ ./client/dist/

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server/dist/index.js"]
