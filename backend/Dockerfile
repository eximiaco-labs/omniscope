FROM python:3.12-slim

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r ./requirements.txt

COPY . .
COPY ./src/api/schema.graphql ./api/schema.graphql

EXPOSE 5001

CMD ["python", "src/app.py"]

RUN mkdir /.cache && chmod 777 /.cache
