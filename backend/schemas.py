from pydantic import BaseModel
from typing import List

class NodeCreate(BaseModel):
    x: float
    y: float

class PathCreate(BaseModel):
    picture_id: int
    nodes: List[NodeCreate]
