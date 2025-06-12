import psycopg2 #адаптер postgresql
from psycopg2.extras import RealDictCursor #курсор для результатов запросов
import os #для доступа к переменным
from dotenv import load_dotenv #загружает переменные из файла .env

load_dotenv('db.env')

def get_db():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        cursor_factory=RealDictCursor
    )
    return conn