FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY api/requirements.txt ./api/
COPY shared/requirements.txt ./shared/
COPY utils/requirements.txt ./utils/
COPY models/requirements.txt ./models/

COPY api ./api
COPY shared ./shared
COPY utils ./utils
COPY models ./models

RUN pip install --no-cache-dir -r api/requirements.txt \
    && pip install --no-cache-dir -r shared/requirements.txt \
    && pip install --no-cache-dir -r utils/requirements.txt \
    && pip install --no-cache-dir -r models/requirements.txt

RUN pip install -e ./shared \
    && pip install -e ./utils \
    && pip install -e ./models \
    && pip install -e ./api

ENV PYTHONPATH=/app
ENV FLASK_APP=/app/api/src/app.py

EXPOSE 5001

WORKDIR /app/api/src

CMD ["python", "app.py"]

RUN mkdir /.cache && chmod 777 /.cache
