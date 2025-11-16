import { useState, useEffect } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';

interface Dress {
  id: string;
  name: string;
  style: string;
  imageUrl: string;
  filename: string;
}

interface DressSelectorProps {
  onSelectionChange: (selectedIds: string[]) => void;
  maxSelection?: number;
}

// API 기본 URL 설정 (환경 변수에서 가져오거나 기본값 사용)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function DressSelector({ onSelectionChange, maxSelection = 6 }: DressSelectorProps) {
  const [selectedDresses, setSelectedDresses] = useState<Set<string>>(new Set());
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API에서 드레스 목록을 가져오는 함수
  useEffect(() => {
    const fetchDresses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/v1/dresses`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // API 응답에서 받은 이미지 URL을 완전한 URL로 변환
        const processedDresses = data.dresses.map((dress: any) => ({
          ...dress,
          imageUrl: `${API_BASE_URL}${dress.imageUrl}`
        }));
        
        setDresses(processedDresses);
      } catch (err) {
        console.error('드레스 목록을 가져오는 중 오류 발생:', err);
        setError(err instanceof Error ? err.message : '드레스 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDresses();
  }, []);

  const toggleDress = (dressId: string) => {
    const newSelected = new Set(selectedDresses);
    
    if (newSelected.has(dressId)) {
      newSelected.delete(dressId);
    } else {
      if (newSelected.size >= maxSelection) {
        return; // Max selection reached
      }
      newSelected.add(dressId);
    }
    
    setSelectedDresses(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  const isSelected = (dressId: string) => selectedDresses.has(dressId);
  const canSelectMore = selectedDresses.size < maxSelection;

  return (
    <div className="w-full">
      <div className="mb-6 text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-slate-700">시착할 드레스를 선택해주세요</h3>
          <Badge 
            variant="secondary" 
            className={`${
              selectedDresses.size === maxSelection 
                ? 'bg-lime-100 text-lime-700 border-lime-300' 
                : 'bg-sky-100 text-sky-700 border-sky-300'
            }`}
          >
            {selectedDresses.size} / {maxSelection}
          </Badge>
        </div>
        <p className="text-blue-600 text-sm">
          최대 {maxSelection}개까지 선택 가능합니다
        </p>
      </div>

      <ScrollArea className="h-[500px] rounded-2xl border-2 border-sky-100 bg-white/50 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-slate-600">드레스 목록을 불러오는 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <Alert className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          </div>
        ) : dresses.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-slate-600">사용 가능한 드레스가 없습니다.</p>
              <p className="text-slate-500 text-sm mt-1">NAS 폴더에 이미지를 추가해주세요.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dresses.map((dress) => {
            const selected = isSelected(dress.id);
            const disabled = !selected && !canSelectMore;

            return (
              <Card
                key={dress.id}
                className={`relative overflow-hidden cursor-pointer transition-all ${
                  selected
                    ? 'border-2 border-lime-400 shadow-lg ring-2 ring-lime-200'
                    : disabled
                    ? 'border-2 border-slate-200 opacity-50 cursor-not-allowed'
                    : 'border-2 border-sky-100 hover:border-sky-300 hover:shadow-md'
                }`}
                onClick={() => !disabled && toggleDress(dress.id)}
              >
                <div className="relative aspect-[3/4]">
                  <img
                    src={dress.imageUrl}
                    alt={dress.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Selection indicator */}
                  {selected && (
                    <div className="absolute inset-0 bg-lime-400/20 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-lime-400 flex items-center justify-center shadow-lg">
                        <Check className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Style badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-white/90 text-slate-700 border-slate-200 text-xs">
                      {dress.style}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-3 bg-white">
                  <p className="text-slate-700 text-sm text-center truncate">
                    {dress.name}
                  </p>
                </div>
              </Card>
            );
          })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
