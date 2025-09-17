# ---------------------
# Stage 1: Build frontend
# ---------------------
FROM oven/bun:1 AS frontend

WORKDIR /app

COPY web/package.json ./
COPY web/bun.lockb* ./
RUN bun install

COPY web/ ./
RUN bun run build

# ---------------------
# Stage 2: Backend (Python + uv + FastAPI)
# ---------------------
FROM python:3.12-slim AS backend

# systémové dependency
RUN apt update && apt install -y --no-install-recommends \
    curl build-essential \
    && rm -rf /var/lib/apt/lists/*

# Download the latest installer
ADD https://astral.sh/uv/install.sh /uv-installer.sh

# Run the installer then remove it
RUN sh /uv-installer.sh && rm /uv-installer.sh

ENV PATH="/root/.local/bin/:$PATH"

COPY input /input
COPY --from=frontend /app/dist /web/dist
COPY server /server

WORKDIR /server

RUN uv sync --frozen

CMD ["uv", "run", "fastapi", "run", "server.py", "--host", "0.0.0.0", "--port", "8000"]
