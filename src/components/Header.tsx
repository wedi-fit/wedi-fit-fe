import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full border-b border-sky-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-sky-500" />
          <h1 className="text-center text-slate-700">
            AI 웨딩드레스 가상 시착
          </h1>
        </div>
        <p className="text-center text-blue-600 mt-2">
          당신의 완벽한 웨딩드레스를 AI로 미리 만나보세요
        </p>
      </div>
    </header>
  );
}
