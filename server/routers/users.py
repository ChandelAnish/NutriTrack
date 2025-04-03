from fastapi import Depends, APIRouter
from sqlmodel import  Session
from ..db import get_session
from typing import Annotated
from ..schemas import userschema, responseUserSchema
from ..controllers.users import getAllUsers, getSingleUsers, addNewUsers
from ..models import User
from pydantic import BaseModel

router = APIRouter(
    prefix="/user",
    tags=["users"]
)

SessionDep = Annotated[Session, Depends(get_session)]

#get all users
@router.get("/showAll", response_model=list[responseUserSchema])
def getUsers(session: SessionDep):
    return getAllUsers(session)

class usersLogin(BaseModel):
    email: str
    password: str
# get single user
@router.post("/login", response_model=responseUserSchema)
def getUser(userdata: usersLogin, session: SessionDep):
    return getSingleUsers(userdata,session)

# add user
@router.post("/addUser", response_model=responseUserSchema)
def addUser(user: userschema, session: SessionDep):
    return addNewUsers(user,session)