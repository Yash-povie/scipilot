from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import asyncpg
import os
from auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth")

class UserRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

async def get_db():
    conn = await asyncpg.connect(os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/scipilot"))
    try:
        yield conn
    finally:
        await conn.close()

@router.post("/register", response_model=Token)
async def register(user: UserRequest, db: asyncpg.Connection = Depends(get_db)):
    hashed_pwd = hash_password(user.password)
    try:
        await db.execute("INSERT INTO users (username, hashed_password) VALUES ($1, $2)", user.username, hashed_pwd)
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    token = create_access_token({"sub": user.username})
    return Token(access_token=token, token_type="bearer")

@router.post("/login", response_model=Token)
async def login(user: UserRequest, db: asyncpg.Connection = Depends(get_db)):
    record = await db.fetchrow("SELECT hashed_password FROM users WHERE username = $1", user.username)
    if not record or not verify_password(user.password, record["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user.username})
    return Token(access_token=token, token_type="bearer")
