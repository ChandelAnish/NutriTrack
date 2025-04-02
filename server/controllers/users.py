from sqlmodel import  Session, select
from ..models import User
from fastapi import HTTPException

def getAllUsers(session):
    statement = select(User)
    results = session.exec(statement)
    return results.all()

def getSingleUsers(id,session):
    user = session.get(User, id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    return user

def addNewUsers(user, session):
    db_user = User(
        name=user.name, email=user.email, password=user.password
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user