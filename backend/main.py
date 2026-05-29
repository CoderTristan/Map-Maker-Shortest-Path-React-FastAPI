import os
from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from database import SessionLocal, engine
from models import Picture, Base
from fastapi.middleware.cors import CORSMiddleware

from schemas import PathCreate, NodeCreate
from models import Path, Node

Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)



UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/add-pic")
async def add_pic(
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not image.content_type.startswith("image/"):
        return JSONResponse({"error": "File must be an image"}, status_code=400)

    file_location = os.path.join(UPLOAD_DIR, image.filename)
    with open(file_location, "wb") as f:
        f.write(await image.read())

    pic = Picture(
        filename=image.filename,
        filepath=file_location,
        content_type=image.content_type
    )
    db.add(pic)
    db.commit()
    db.refresh(pic)

    return {
        "id": pic.id,
        "filename": pic.filename,
        "path": pic.filepath
    }

@app.get("/images/{filename}")
def get_image(filename: str):
    file_path = f"uploads/{filename}"
    return FileResponse(file_path)

@app.get("/pictures")
def list_pictures(db: Session = Depends(get_db)):
    pics = db.query(Picture).all()
    return [
        {
            "id": p.id,
            "filename": p.filename,
            "url": f"http://localhost:8000/images/{p.filename}"
        }
        for p in pics
    ]

@app.post("/paths")
def save_path(path: PathCreate, db: Session = Depends(get_db)):
    new_path = Path(picture_id=path.picture_id)
    db.add(new_path)
    db.commit()
    db.refresh(new_path)

    for node in path.nodes:
        db.add(Node(
            picture_id=path.picture_id,
            path_id=new_path.id,
            x=node.x,
            y=node.y
        ))

    db.commit()

    return {"path_id": new_path.id}

@app.get("/paths/{picture_id}")
def get_paths(picture_id: int, db: Session = Depends(get_db)):
    paths = db.query(Path).filter(Path.picture_id == picture_id).all()

    result = []
    for p in paths:
        nodes = db.query(Node).filter(Node.path_id == p.id).all()
        result.append({
            "id": p.id,
            "nodes": [{"id": n.id, "x": n.x, "y": n.y} for n in nodes]
        })

    return result