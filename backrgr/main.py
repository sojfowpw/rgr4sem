import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from pydantic import BaseModel
from database import get_db
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
import psycopg2
from datetime import datetime, timedelta
import random
import time
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from threading import Thread

load_dotenv('db.env')

app = FastAPI()
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"], pbkdf2_sha256__default_rounds=30000, deprecated="auto"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  
)

class UserRegistration(BaseModel): # для регистрации
    login: str
    password: str
    name: str
    surname: str

class UserLogin(BaseModel): # для входа
    login: str
    password: str



@app.post("/registration") # регистрация
async def registration(user: UserRegistration, conn=Depends(get_db)):
    try:        
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1 FROM users WHERE login = %s", (user.login,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Такой логин уже существует")
            
            hashed = pwd_context.hash(user.password)
            print(f"Хеш: {hashed}")
            
            query = """
                INSERT INTO users (role_, login, passhash, name_, surname)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """
            params = (1, user.login, hashed, user.name, user.surname)
            print(f"Запрос: {query} {params}")
            
            cursor.execute(query, params)
            result = cursor.fetchone()
            print(f"Результат запроса: {result}")
            
            if result is None:
                raise HTTPException(status_code=500, detail="Ошибка при добавлении пользователя")
            
            user_id = result['id'] 
            
            conn.commit()
            
            return {"status": "success", "id": user_id}
            
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Ошибка PostgreSQL: {e.pgerror}")
        raise HTTPException(status_code=500, detail="Ошибка базы данных")




SECRET_KEY = "clkmdlfkndmkjdjfkdjbdfklmbmcvnhjmfy"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Неверные учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.JWTError:
        raise credentials_exception
    
    return {"id": user_id, "role": payload.get("role")}

@app.post("/login")
async def login(user: UserLogin, conn=Depends(get_db)):
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, role_, passhash FROM users WHERE login = %s", 
                (user.login,)
            )
            result = cursor.fetchone()
            if result:
                user_id = result['id']
                role = result['role_']
                hashed = result['passhash']

                if pwd_context.verify(user.password, hashed):
                    # Создаем JWT токен
                    access_token = create_access_token(
                        data={"sub": str(user_id), "role": role}
                    )
                    return {
                        "status": "success",
                        "access_token": access_token,
                        "token_type": "bearer",
                        "id": user_id,
                        "role": role
                    }
                else:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Неверный логин или пароль"
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Неверный логин или пароль"
                )

    except psycopg2.Error as e:
        conn.rollback()
        print(f"Ошибка PostgreSQL: {e.pgerror}")
        raise HTTPException(status_code=500, detail="Ошибка базы данных")


        
@app.get("/user") # получение имени и фамилии
async def get_user(id: str = Query(...), current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT name_, surname FROM users WHERE id = %s", (id,))
            result = cursor.fetchone()
            if result:
                name = result['name_']
                surname = result['surname']
                return {"status": "success", "name": name, "surname": surname}
            
            else:
                raise HTTPException(status_code=404, detail="Данные не найдены")
            
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Ошибка PostgreSQL: {e.pgerror}")
        raise HTTPException(status_code=500, detail="Ошибка базы данных")
    


@app.get("/people") # получение работников
async def get_employee(current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, name_, surname FROM users WHERE role_ = %s", (1, ))
            employees = cursor.fetchall()
            if employees:
                result = [
                    {
                        "id": emp["id"],
                        "name": emp["name_"],
                        "surname": emp["surname"]
                    }
                    for emp in employees
                ]
                return {"status": "success", "employees": employees}
            
            else:
                raise HTTPException(status_code=404, detail="Данные не найдены")
            
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Ошибка PostgreSQL: {e.pgerror}")
        raise HTTPException(status_code=500, detail="Ошибка базы данных")
    


@app.delete("/people/{user_id}") # удаление работника
async def delete_employee(user_id: int, current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            conn.commit()
            return {"status": "success"}
        
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Ошибка PostgreSQL: {e.pgerror}")
        raise HTTPException(status_code=500, detail="Ошибка базы данных")
    


@app.get("/people/{user_id}") # получение данных о работнике
async def get_person(user_id: int, current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT name_, surname FROM users WHERE id = %s", (user_id,))
            result = cursor.fetchone()
            if result:
                name = result['name_']
                surname = result['surname']
                return {"status": "success", "name": name, "surname": surname}
            
            else:
                raise HTTPException(status_code=404, detail="Данные не найдены")
            
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Ошибка PostgreSQL: {e.pgerror}")
        raise HTTPException(status_code=500, detail="Ошибка базы данных")
    


@app.put("/people/{user_id}") # изменение информации о работнике
async def update_person(user_id: int, emp_data: dict,  current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE users SET name_ = %s, surname = %s WHERE id = %s", (emp_data["name"], emp_data["surname"], user_id))
            conn.commit()
            return {"status": "success"}
        
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Ошибка PostgreSQL: {e.pgerror}")
        raise HTTPException(status_code=500, detail="Ошибка базы данных")
    


@app.get("/devices") # получение информации об устройствах
async def get_devices(conn=Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, ip, type_, location, status FROM devices")
            devices = cursor.fetchall()
            if devices:
                result = [
                    {
                        "id": dev["id"],
                        "ip": dev["ip"],
                        "type": dev["type_"],
                        "location": dev["location"],
                        "status": dev["status"]
                    }
                    for dev in devices
                ]
                return {"status": "success", "devices": devices}
            
            else:
                raise HTTPException(status_code=404, detail="Данные не найдены")
            
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Ошибка PostgreSQL: {e.pgerror}")
        raise HTTPException(status_code=500, detail="Ошибка базы данных")
    


@app.delete("/device/{device_id}") # удаление устройства
async def delete_device(device_id: int, current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM devices WHERE id = %s", (device_id,))
            conn.commit()
            return {"status": "success"}
        
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Ошибка PostgreSQL: {e.pgerror}")
        raise HTTPException(status_code=500, detail="Ошибка базы данных")
    


@app.get("/device/{device_id}") # получение информации об устройстве
async def get_device(device_id: int, current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT ip, type_, location, status FROM devices WHERE id = %s", (device_id,))
            result = cursor.fetchone()
            if result:
                return {
                    "status": "success",
                    "device": {
                        "ip": result['ip'],
                        "type_": result['type_'],
                        "location": result['location'],
                        "status": result['status']
                    }
                }
            else:
                raise HTTPException(status_code=404, detail="Данные не найдены")
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Ошибка PostgreSQL: {e}")
        raise HTTPException(status_code=500, detail="Ошибка базы данных")
    


def get_db_connection(): # скрипт
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    )

async def update_device_statuses_sync():
    while True:
        conn = None
        try:
            conn = get_db_connection()
            with conn.cursor() as cursor:
                cursor.execute("SELECT id FROM devices")
                device_ids = [row[0] for row in cursor.fetchall()]
                for device_id in device_ids:
                    new_status = random.randint(0, 1)
                    new_status = "В сети" if new_status == 1 else "Не в сети"
                    current_time = datetime.now()

                    cursor.execute(
                        "UPDATE devices SET status = %s WHERE id = %s",
                        (new_status, device_id))
                    
                    cursor.execute(
                        """INSERT INTO logs 
                        (id_device, new_status, date, time) 
                        VALUES (%s, %s, %s, %s)""",
                        (device_id, new_status, current_time.date(), current_time.time()))
                
                conn.commit()
                print(f"Статусы обновлены {datetime.now()}")

        except Exception as e:
            print(f"Ошибка обновления статусов: {e}")
            if conn:
                conn.rollback()  # Откатить изменения в случае ошибки
        finally:
            if conn:
                conn.close()  # Закрыть соединение

        await asyncio.sleep(3600)  # Асинхронная задержка

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(update_device_statuses_sync())



@app.get("/logs") # получение информации о логах
async def get_logs(current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    l.id,
                    l.id_device,
                    d.ip as device_ip,
                    l.new_status,
                    l.date,
                    l.time
                FROM logs l
                LEFT JOIN devices d ON l.id_device = d.id
                ORDER BY l.date DESC, l.time DESC
            """)
            logs = cursor.fetchall()
            if logs:
                result = [
                    {
                        "id": l["id"],
                        "id_device": l["id_device"],
                        "device_ip": l["device_ip"],
                        "new_status": l["new_status"],
                        "date": l["date"],
                        "time": l["time"]
                    }
                    for l in logs
                ]
                return {"status": "success", "logs": logs}
            
            else:
                raise HTTPException(status_code=404, detail="Данные не найдены")
            
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Ошибка PostgreSQL: {e.pgerror}")
        raise HTTPException(status_code=500, detail="Ошибка базы данных")