import { Download, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useState } from 'react';

interface ResultImage {
  id: string;
  url: string;
  style: string;
  name: string;
}

interface ResultGalleryProps {
  results: ResultImage[];
}

export function ResultGallery({ results }: ResultGalleryProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (results.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-200 to-transparent" />
        <h2 className="text-slate-700 px-4">AI가 생성한 웨딩드레스 스타일</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-200 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {results.map((result) => (
          <Card key={result.id} className="overflow-hidden border-2 border-sky-100 hover:border-lime-300 transition-all hover:shadow-xl group">
            <div className="relative aspect-[3/4] bg-gradient-to-br from-sky-50 to-purple-50">
              <img
                src={result.url}
                alt={`Wedding dress: ${result.name}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge className="bg-white/90 text-blue-700 border-sky-200">
                  {result.style}
                </Badge>
              </div>
              <Button
                onClick={() => toggleFavorite(result.id)}
                variant="ghost"
                size="icon"
                className={`absolute top-3 right-3 rounded-full backdrop-blur-sm transition-all ${
                  favorites.has(result.id)
                    ? 'bg-lime-400 text-white hover:bg-lime-500'
                    : 'bg-white/90 text-lime-600 hover:bg-white hover:text-lime-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorites.has(result.id) ? 'fill-current' : ''}`} />
              </Button>
            </div>
            <div className="p-4 bg-white">
              <Button
                className="w-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = result.url;
                  link.download = `${result.name.replace(/\s+/g, '-')}.jpg`;
                  link.click();
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                이미지 저장
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
