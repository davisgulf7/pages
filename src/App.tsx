import FlipbookViewer from './components/FlipbookViewer';
import { BookOpen } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col selection:bg-blue-500/30">
      {/* Liquid Glass Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-violet-600/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />

      {/* Mesh/Grid overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      <header className="relative z-10 w-full p-6 border-b border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent tracking-tight">
                Lumina
              </h1>
              <p className="text-xs text-blue-200/50 font-medium tracking-widest uppercase">PWA Edition</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com/davisgulf7/pages" target="_blank" rel="noreferrer" className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-all hover:scale-105">
              GitHub Repo
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-6 flex flex-col">
        <FlipbookViewer />
      </main>
    </div>
  );
}

export default App;
