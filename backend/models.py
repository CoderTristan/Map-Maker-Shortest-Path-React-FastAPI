from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Picture(Base):
    __tablename__ = "pictures"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    content_type = Column(String, nullable=False)

    paths = relationship("Path", back_populates="picture")


class Path(Base):
    __tablename__ = "paths"

    id = Column(Integer, primary_key=True, index=True)
    picture_id = Column(Integer, ForeignKey("pictures.id"))

    picture = relationship("Picture", back_populates="paths")
    nodes = relationship("Node", back_populates="path")


class Node(Base):
    __tablename__ = "nodes"

    id = Column(Integer, primary_key=True, index=True)
    picture_id = Column(Integer, ForeignKey("pictures.id"))
    path_id = Column(Integer, ForeignKey("paths.id"))
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)

    path = relationship("Path", back_populates="nodes")
