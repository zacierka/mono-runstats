FROM oven/bun:1

WORKDIR /app

# Copy only webstrava files
COPY package.json bun.lock* ./
RUN bun install

COPY . .

EXPOSE 3000

CMD ["bun", "run", "start"]