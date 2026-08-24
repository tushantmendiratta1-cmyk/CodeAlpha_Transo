FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/api-spec run codegen
RUN pnpm run typecheck
RUN PORT=23933 BASE_PATH=/ pnpm --filter @workspace/transo run build
RUN pnpm --filter @workspace/api-server run build

FROM node:22-alpine AS runtime
WORKDIR /app
RUN corepack enable && addgroup -S transo && adduser -S transo -G transo
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=build /app/artifacts/transo/dist ./artifacts/transo/dist
COPY --from=build /app/artifacts/api-server/package.json ./artifacts/api-server/package.json
COPY --from=build /app/artifacts/transo/package.json ./artifacts/transo/package.json
USER transo
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]