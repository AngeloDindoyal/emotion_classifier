FROM python:3.11

WORKDIR /code

COPY requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir -r /code/requirements.txt

COPY app /code/app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

#docker system prune -a -f
#docker build --no-cache -t fer_app . 
#docker run --name  container_name -p 8000:8000 fer_app