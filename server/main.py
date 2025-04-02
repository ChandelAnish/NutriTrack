from fastapi import FastAPI, Depends
from sqlmodel import SQLModel, Session
from .db import engine, get_session
from typing import Annotated
from .routers import mealList, users
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:8081"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

SessionDep = Annotated[Session, Depends(get_session)]

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

#including the users router
app.include_router(users.router)

#including the mealList router
app.include_router(mealList.router)