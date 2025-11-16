import { Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File, previewUrl: string) => void;
  selectedImage: string | null;
  onClear: () => void;
  isProcessing: boolean;
}

export function ImageUploader({ onImageSelect, selectedImage, onClear, isProcessing }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      onImageSelect(file, previewUrl);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      onImageSelect(file, previewUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!selectedImage ? (
        <div
          className={`relative border-2 border-dashed rounded-2xl transition-all aspect-[3/4] flex items-center justify-center ${
            isDragging
              ? 'border-lime-400 bg-lime-50'
              : 'border-sky-200 bg-white hover:border-sky-300 hover:bg-sky-50/30'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
          <div className="flex flex-col items-center gap-4 pointer-events-none px-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-100 to-purple-100 flex items-center justify-center">
              <Upload className="w-8 h-8 text-sky-600" />
            </div>
            <div className="text-center">
              <p className="text-slate-700 mb-2">
                전신 사진을 업로드해주세요
              </p>
              <p className="text-blue-600 text-sm">
                클릭하거나 드래그하여 이미지를 업로드하세요
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden bg-white border-2 border-sky-200 aspect-[3/4]">
          <img
            src={selectedImage}
            alt="Uploaded preview"
            className="w-full h-full object-cover"
          />
          {!isProcessing && (
            <Button
              onClick={onClear}
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4 rounded-full shadow-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
