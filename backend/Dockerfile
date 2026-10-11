FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN groupadd --system dashboard && useradd --system --gid dashboard dashboard
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
USER dashboard

EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host ${BACKEND_HOST:-127.0.0.1} --port ${BACKEND_PORT:-8000} --proxy-headers --no-server-header"]
