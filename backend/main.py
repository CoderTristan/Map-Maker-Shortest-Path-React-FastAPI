import os
from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from database import SessionLocal, engine
from models import Picture, Base

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI()

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

    # Save file to disk
    file_location = os.path.join(UPLOAD_DIR, image.filename)
    with open(file_location, "wb") as f:
        f.write(await image.read())

    # Save metadata to Postgres
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