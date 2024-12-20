from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List
import base64
import os
from datetime import datetime
from pydantic import BaseModel

app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB configuration
MONGO_URL = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URL)
db = client.inpainting_db
image_pairs_collection = db.image_pairs


# Models
class ImagePair(BaseModel):
    original_image: str
    mask_image: str
    created_at: datetime = datetime.now()


class ImagePairResponse(BaseModel):
    id: str
    original_image: str
    mask_image: str
    created_at: datetime


# Helper functions
async def save_file(file: UploadFile) -> str:
    """Save uploaded file and return base64 encoded string"""
    contents = await file.read()
    base64_encoded = base64.b64encode(contents).decode('utf-8')
    return f"data:{file.content_type};base64,{base64_encoded}"


# Routes
@app.post("/api/upload-pair")
async def upload_image_pair(
        original: UploadFile = File(...),
        mask: UploadFile = File(...)
):
    """Upload an original image and its mask"""
    try:
        # Convert images to base64
        original_base64 = await save_file(original)
        mask_base64 = await save_file(mask)

        # Create document in MongoDB
        image_pair = {
            "original_image": original_base64,
            "mask_image": mask_base64,
            "created_at": datetime.now()
        }

        result = await image_pairs_collection.insert_one(image_pair)

        return {
            "id": str(result.inserted_id),
            "message": "Image pair uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/image-pairs", response_model=List[ImagePairResponse])
async def get_image_pairs():
    """Get all image pairs"""
    try:
        image_pairs = []
        cursor = image_pairs_collection.find().sort("created_at", -1)
        async for doc in cursor:
            image_pairs.append(
                ImagePairResponse(
                    id=str(doc["_id"]),
                    original_image=doc["original_image"],
                    mask_image=doc["mask_image"],
                    created_at=doc["created_at"]
                )
            )
        return image_pairs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/image-pair/{pair_id}", response_model=ImagePairResponse)
async def get_image_pair(pair_id: str):
    """Get a specific image pair by ID"""
    try:
        doc = await image_pairs_collection.find_one({"_id": ObjectId(pair_id)})
        if doc is None:
            raise HTTPException(status_code=404, detail="Image pair not found")

        return ImagePairResponse(
            id=str(doc["_id"]),
            original_image=doc["original_image"],
            mask_image=doc["mask_image"],
            created_at=doc["created_at"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/image-pair/{pair_id}")
async def delete_image_pair(pair_id: str):
    """Delete a specific image pair by ID"""
    try:
        result = await image_pairs_collection.delete_one({"_id": ObjectId(pair_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Image pair not found")
        return {"message": "Image pair deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)