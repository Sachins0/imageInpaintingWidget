import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw, Trash2 } from 'lucide-react';

const ImagePairGallery = () => {
  const [imagePairs, setImagePairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchImagePairs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/image-pairs');
      if (!response.ok) throw new Error('Failed to fetch image pairs');
      const data = await response.json();
      setImagePairs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteImagePair = async (id) => {
    if (!confirm('Are you sure you want to delete this image pair?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/image-pair/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete image pair');
      
      // Remove the deleted pair from state
      setImagePairs(prev => prev.filter(pair => pair.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchImagePairs();
  }, []);

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Saved Image Pairs</CardTitle>
        <Button 
          onClick={fetchImagePairs} 
          variant="outline"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
            Error: {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {imagePairs.map((pair) => (
            <Card key={pair.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    {new Date(pair.created_at).toLocaleString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteImagePair(pair.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium mb-1">Original</p>
                    <img
                      src={pair.original_image}
                      alt="Original"
                      className="w-full h-auto rounded border border-gray-200"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Mask</p>
                    <img
                      src={pair.mask_image}
                      alt="Mask"
                      className="w-full h-auto rounded border border-gray-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {!loading && imagePairs.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No saved image pairs found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImagePairGallery;