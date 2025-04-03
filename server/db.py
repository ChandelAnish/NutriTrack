from sqlmodel import create_engine, Session

DATABASE_URL = "postgresql://postgres:235689@localhost:5432/nutritrack"
engine = create_engine(DATABASE_URL)


def get_session():
    with Session(engine) as session:
        yield session