FROM python:3.12-slim AS backend

ENV POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app

COPY backend/pyproject.toml backend/poetry.lock ./

RUN pip install --no-cache-dir poetry \
    && poetry config installer.max-workers 10 \
    && poetry install --no-interaction --no-ansi --no-root

COPY . .

EXPOSE 8000

CMD ["poetry", "run", "daphne", "-b", "0.0.0.0", "-p", "8000", "core.asgi:application"]


FROM node:18 AS frontend

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./

RUN npm install

COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim AS final

WORKDIR /app

COPY --from=backend /app /app

COPY --from=frontend /app/build /app/backend/staticfiles/

CMD ["poetry", "run", "daphne", "-b", "0.0.0.0", "-p", "8000", "core.asgi:application"]
