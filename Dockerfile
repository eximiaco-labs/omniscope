FROM python:3.12-slim

WORKDIR /code

COPY src/requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r ./requirements.txt

COPY src .

EXPOSE 80

CMD ["python", "app.py"]

RUN mkdir /.cache
RUN chmod 777 /.cache
