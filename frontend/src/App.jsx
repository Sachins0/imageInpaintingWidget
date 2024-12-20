import React, { useRef, useState } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Upload, Download, Eraser, Save } from 'lucide-react';
import ImagePairGallery from './components/ImagePairGallery';

const App = () => {
  const [brushSize, setBrushSize] = useState(20);
  const [originalImage, setOriginalImage] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);

  const handleImageUpload = (event) => {
    if (!event.target.files || !event.target.files[0]) return;
    
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 600;
        let newWidth = img.width;
        let newHeight = img.height;

        if (newWidth > maxWidth) {
          newHeight = (maxWidth * newHeight) / newWidth;
          newWidth = maxWidth;
        }
        if (newHeight > maxHeight) {
          newWidth = (maxHeight * newWidth) / newHeight;
          newHeight = maxHeight;
        }

        setCanvasSize({
          width: Math.round(newWidth),
          height: Math.round(newHeight)
        });
        setOriginalImage(e.target.result);
        
        if (canvasRef.current) {
          canvasRef.current.clear();
        }
        setMaskImage(null);
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  const generateMask = () => {
    if (!canvasRef.current) return;

    if (!maskCanvasRef.current) {
      maskCanvasRef.current = document.createElement('canvas');
    }
    const maskCanvas = maskCanvasRef.current;
    maskCanvas.width = canvasSize.width;
    maskCanvas.height = canvasSize.height;
    const ctx = maskCanvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    const drawingCanvas = canvasRef.current.canvasContainer.children[1];
    ctx.drawImage(drawingCanvas, 0, 0);

    setMaskImage(maskCanvas.toDataURL());
  };

  const downloadMask = () => {
    if (!maskImage) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = maskImage;
    link.download = 'mask.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveToServer = async () => {
    if (!originalImage || !maskImage) return;

    setIsSaving(true);
    try {
      // Convert base64 to blob
      const originalBlob = await fetch(originalImage).then(r => r.blob());
      const maskBlob = await fetch(maskImage).then(r => r.blob());

      // Create FormData
      const formData = new FormData();
      formData.append('original', originalBlob, 'original.png');
      formData.append('mask', maskBlob, 'mask.png');

      // Send to server
      const response = await fetch('http://localhost:8000/api/upload-pair', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save images');
      }

      const data = await response.json();
      console.log('Saved successfully with ID:', data.id);
      alert('Images saved successfully!');
    } catch (error) {
      console.error('Error saving images:', error);
      alert('Failed to save images. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    setMaskImage(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Image Inpainting Widget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex gap-2 flex-wrap">
              <Button className="relative">
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              
              <Button 
                onClick={generateMask} 
                disabled={!originalImage}
              >
                <Download className="mr-2 h-4 w-4" />
                Generate Mask
              </Button>
              
              <Button 
                onClick={clearCanvas} 
                variant="outline" 
                disabled={!originalImage}
              >
                <Eraser className="mr-2 h-4 w-4" />
                Clear Canvas
              </Button>

              {maskImage && (
                <>
                  <Button 
                    onClick={downloadMask}
                    variant="secondary"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Mask
                  </Button>

                  <Button 
                    onClick={saveToServer}
                    disabled={isSaving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save to Server'}
                  </Button>
                </>
              )}
            </div>

            {/* Brush Size Control */}
            <div className="flex items-center gap-4">
              <span className="text-sm">Brush Size:</span>
              <div className="w-48">
                <Slider
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  min={1}
                  max={50}
                />
              </div>
            </div>

            {/* Canvas */}
            <div className="border rounded-lg overflow-hidden bg-black">
              <CanvasDraw
                ref={canvasRef}
                brushColor="#ffffff"
                backgroundColor="#000000"
                brushRadius={brushSize}
                lazyRadius={0}
                canvasWidth={canvasSize.width}
                canvasHeight={canvasSize.height}
                imgSrc={originalImage}
                hideGrid
                className="touch-none"
                disabled={!originalImage}
              />
            </div>

            {/* Display Images */}
            {originalImage && maskImage && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Original Image</h3>
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Mask</h3>
                  <img
                    src={maskImage}
                    alt="Mask"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <ImagePairGallery/>
    </div>
  );
};

export default App;