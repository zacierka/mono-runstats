# Use official Bun image
FROM oven/bun:1.1

# Set working directory
WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy rest of project
COPY . .



# Expose nothing (Discord bot doesn't need ports)
EXPOSE 4000

# Run bot
CMD ["bun", "run", "src/index.ts"]