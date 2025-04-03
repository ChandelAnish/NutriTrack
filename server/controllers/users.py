from sqlmodel import Session, select
from ..models import User
from fastapi import HTTPException


def getAllUsers(session):
    statement = select(User)
    results = session.exec(statement)
    return results.all()


def getSingleUsers(userdata, session):
    user = session.exec(select(User).where(User.email == userdata.email)).first()  
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.password != userdata.password: 
        raise HTTPException(status_code=401, detail="Incorrect password")  # Handle incorrect password
    
    return user



def addNewUsers(user, session):
    db_user = User(
        email=user.email,
        password=user.password,
        age=user.age,
        weight=user.weight,
        targetWeight=user.targetWeight,
        height=user.height,
        gender=user.gender,
        daily_physical_activity=user.daily_physical_activity,
        dietary_preferences=user.dietary_preferences,
        allergies=user.allergies,
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user
