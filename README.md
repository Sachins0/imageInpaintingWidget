# Image Inpainting Widget

A simple web application for creating and exporting masks for image inpainting tasks. The app allows users to upload an image, draw masks using a brush, and save the original and mask images.

---

## Features
- Upload an image.
- Draw on the image to create a mask.
- Adjust brush size.
- Clear the mask to start over.
- Export and view the original image and the mask side-by-side.
- Back-end stores images and metadata using FastAPI and MongoDB.

---

## Live Demo
You can view the live demo [here](https://image-inpainting-widget.vercel.app/) (deploy using [Vercel](https://vercel.com/)).

---

## Frontend Setup

### Prerequisites
- Node.js (v16+ recommended)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/image-inpainting-widget.git
   cd image-inpainting-widget/frontend
   ```
2. Install dependencies:
   ```bash
   npm install --force
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Visit the app at `http://localhost:5173/`.

---

## Backend Setup

### Prerequisites
- Python (v3.9+ recommended)
- MongoDB instance (local or cloud-hosted)

### Steps
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # macOS/Linux
   .venv\Scripts\activate   # Windows
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn pymongo 
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
5. The API will be available at `http://localhost:8000`.

---

## Libraries Used

### Frontend
- **React**: For building the user interface.
- **React Canvas Draw**: For canvas drawing capabilities.
- **Tailwind CSS and shadcn/ui**: For styling the application.

### Backend
- **FastAPI**: For creating RESTful APIs.
- **MongoDB**: For storing image metadata.
- **Uvicorn**: For running the FastAPI app.

---

## Deployment

### Frontend (Vercel)
1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Deploy the frontend:
   ```bash
   cd frontend
   vercel deploy
   ```

### Backend (Optional Hosting Service)
- Use platforms like AWS, Heroku, or Railway for hosting the backend.

---

