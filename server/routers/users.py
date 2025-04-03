from fastapi import Depends, APIRouter, HTTPException
from sqlmodel import  Session
from ..db import get_session
from typing import Annotated
from ..schemas import userschema, responseUserSchema
from ..controllers.users import getAllUsers, getSingleUsers, addNewUsers
from ..models import User
from pydantic import BaseModel
from sqlmodel import Session, select

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

@router.put("/edit/{email}", response_model=responseUserSchema)
def editUser(email: str, user_data: userschema, session: SessionDep):
    user = session.exec(select(User).where(User.email == email)).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Explicitly updating fields
    update_data = user_data.model_dump(exclude_unset=True)  # Get only the provided fields
    for key, value in update_data.items():
        setattr(user, key, value)  # Dynamically update the user object

    session.add(user)  # Mark the object as "dirty"
    session.commit()  # Save changes to the DB
    session.refresh(user)  # Refresh to get the latest data
    
    return user