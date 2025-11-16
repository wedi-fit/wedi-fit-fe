import { useState } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { DressSelector } from './components/DressSelector';
import { ResultGallery } from './components/ResultGallery';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ResultImage {
  id: string;
  url: string;
  style: string;
  name: string;
}

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDresses, setSelectedDresses] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ResultImage[]>([]);

  const handleImageSelect = (file: File, previewUrl: string) => {
    setSelectedFile(file);
    setSelectedImage(previewUrl);
    setResults([]);
  };

  const handleDressSelection = (dressIds: string[]) => {
    setSelectedDresses(dressIds);
  };

  const handleClear = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    setSelectedFile(null);
    setSelectedDresses([]);
    setResults([]);
  };

  const handleGenerate = async () => {
    if (!selectedFile || selectedDresses.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    toast.success('AI가 웨딩드레스 이미지를 생성하고 있습니다...');

    // 진행률 업데이트 시뮬레이션
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      console.log('이미지 생성 시작:', {
        file: selectedFile.name,
        dressCount: selectedDresses.length,
        dressIds: selectedDresses
      });

      // FormData 생성 (프롬프트와 모델명은 백엔드에서 관리)
      const formData = new FormData();
      formData.append('user_image', selectedFile);
      formData.append('dress_ids', JSON.stringify(selectedDresses));

      // API 호출
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      console.log('API 호출:', `${apiUrl}/api/v1/composite`);
      
      const response = await fetch(`${apiUrl}/api/v1/composite`, {
        method: 'POST',
        body: formData,
      });

      console.log('API 응답 상태:', response.status);

      if (!response.ok) {
        let errorMessage = '이미지 합성에 실패했습니다.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
          console.error('API 에러 응답:', errorData);
        } catch (e) {
          console.error('에러 응답 파싱 실패:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('API 응답 데이터:', data);

      clearInterval(progressInterval);
      setProgress(100);

      // API 응답을 ResultImage 형식으로 변환
      const generatedResults: ResultImage[] = data.results
        .filter((result: any) => result.success)
        .map((result: any) => ({
          id: result.dress_id,
          url: `${apiUrl}${result.image_url}`,
          style: result.style,
          name: result.dress_name,
        }));

      console.log('생성된 결과:', generatedResults);

      if (generatedResults.length === 0) {
        // 실패한 이미지들의 에러 메시지 수집
        const failedMessages = data.results
          .filter((r: any) => !r.success)
          .map((r: any) => r.error_message)
          .join(', ');
        
        const errorMsg = failedMessages 
          ? `이미지 합성 실패: ${failedMessages}`
          : '이미지 합성에 실패했습니다. 다시 시도해주세요.';
        
        toast.error(errorMsg);
        setIsProcessing(false);
        return;
      }

      setResults(generatedResults);
      setIsProcessing(false);

      toast.success(
        `웨딩드레스 생성이 완료되었습니다! (${data.success_count}/${data.total_count})`
      );
    } catch (error) {
      clearInterval(progressInterval);
      setIsProcessing(false);
      
      console.error('이미지 생성 오류:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : '이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className={`mx-auto space-y-12 ${results.length > 0 ? 'max-w-6xl' : 'max-w-5xl'}`}>
          {/* Upload Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ImageUploader
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                onClear={handleClear}
                isProcessing={isProcessing}
              />
            </div>
            
            <div className="space-y-6">
              <DressSelector
                onSelectionChange={handleDressSelection}
                maxSelection={6}
              />
            </div>
          </div>

          {selectedImage && selectedDresses.length > 0 && !isProcessing && results.length === 0 && (
            <div className="flex justify-center">
              <Button
                onClick={handleGenerate}
                size="lg"
                className="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white px-12 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                AI로 웨딩드레스 생성하기
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-4 bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-sky-200 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-3 text-blue-700">
                <Sparkles className="w-6 h-6 animate-pulse" />
                <span className="text-center">AI가 당신만의 웨딩드레스를 생성하고 있습니다...</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-center text-blue-600 text-sm">
                {progress}% 완료
              </p>
            </div>
          )}

          {/* Results Section */}
          <ResultGallery results={results} />

          {results.length > 0 && (
            <div className="flex justify-center">
              <Button
                onClick={handleClear}
                variant="outline"
                size="lg"
                className="border-2 border-sky-300 text-blue-700 hover:bg-sky-50 px-8"
              >
                새로운 이미지로 다시 시작하기
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-sky-100 mt-20 py-8 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-slate-600 text-sm">
          <p>© 2025 AI 웨딩드레스 가상 시착 서비스</p>
          <p className="mt-2">당신의 특별한 날을 위한 완벽한 드레스를 찾아보세요</p>
        </div>
      </footer>
    </div>
  );
}
