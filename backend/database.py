from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Example Postgres URL:
# postgresql://username:password@localhost:5432/mydatabase
DATABASE_URL = "postgresql://postgres:Tg40228#26@localhost:5432/postgres"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
