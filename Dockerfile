# Install all node_modules and build the project
FROM mhart/alpine-node:12 as builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile

COPY . .
RUN yarn build

# Install node_modules for production
FROM mhart/alpine-node:12 as production
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile --production

# Copy the above into a slim container
FROM mhart/alpine-node:slim-12
WORKDIR /app

COPY . .
COPY --from=production /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

EXPOSE 3000

# If possible, run your container using `docker run --init`
# Otherwise, you can use `tini`:
# RUN apk add --no-cache tini
# ENTRYPOINT ["/sbin/tini", "--"]

CMD ["./node_modules/.bin/blitz", "start", "--production"]
