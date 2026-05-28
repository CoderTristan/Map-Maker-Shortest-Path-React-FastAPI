from sqlalchemy import Column, Integer, String
from database import Base

class Picture(Base):
    __tablename__ = "pictures"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
