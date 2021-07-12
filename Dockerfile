# Install all node_modules and build the project
FROM mhart/alpine-node:14 as builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN apk add --no-cache make gcc g++ python3 libtool autoconf automake
RUN yarn install --pure-lockfile

COPY . .
RUN NODE_ENV=production yarn blitz prisma generate && yarn build

# Install node_modules for production
FROM mhart/alpine-node:14 as production
WORKDIR /app

COPY package.json yarn.lock ./
RUN apk add --no-cache make gcc g++ python3 libtool autoconf automake
RUN NODE_ENV=production yarn install --frozen-lockfile --production

# Copy the above into a slim container
FROM mhart/alpine-node:slim-14
WORKDIR /app

COPY . .
COPY --from=production /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.blitz ./.blitz

EXPOSE 3000
#
# If possible, run your container using `docker run --init`
# Otherwise, you can use `tini`:
# RUN apk add --no-cache tini

# ENTRYPOINT ["/sbin/tini", "--"]

CMD ["./node_modules/.bin/blitz", "start"]

# FROM node:14-stretch-slim as base
# WORKDIR /opt/app
# RUN apt-get update && apt-get install openssl -y && rm -rf /var/lib/apt/lists/*

# FROM base as env
# COPY package*.json .
# COPY yarn.lock .
# RUN yarn install --frozen-lockfile

# FROM env as dev
# COPY . .
# RUN yarn blitz prisma generate
# CMD yarn dev --port ${PORT}

# FROM dev as build
# RUN yarn next telemetry disable && npm run build

# FROM base as prod

# RUN ls /opt/app/
# COPY --from=build /opt/app/package.json /opt/app/.blitz.config.compiled.js ./
# COPY --from=build /opt/app/node_modules ./node_modules
# COPY --from=build /opt/app/public ./public
# COPY --from=build /opt/app/.blitz ./.blitz
# COPY --from=build /opt/app/.next ./.next

# CMD yarn start --port 3000
