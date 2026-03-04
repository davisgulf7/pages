import { useState, useRef, useEffect } from 'react';
import { Download, RotateCcw, Eye, Clock, GripVertical, Sparkles, Info, HelpCircle, Plus, Minus, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { cardInformation } from './cardInfo';
import { categoryInformation } from './categoryInfo';
import { imageSearchQueries } from './imageSearchQueries';

interface Card {
  id: string;
  label: string;
  category: string;
  correctCategories: string[];
}

interface Category {
  id: string;
  label: string;
  description: string;
  gradient: string;
  accentColor: string;
}

const categories: Category[] = [
  {
    id: 'no',
    label: 'No Tech',
    description: 'Support strategies that require no technology (e.g., prompting, preferential seating)',
    gradient: 'from-emerald-500 to-teal-600',
    accentColor: 'emerald'
  },
  {
    id: 'lo',
    label: 'Low Tech',
    description: 'Simple items with few or no moving parts (e.g., slant boards, highlighters, pencil grips)',
    gradient: 'from-sky-500 to-blue-600',
    accentColor: 'sky'
  },
  {
    id: 'mid',
    label: 'Mid Tech',
    description: 'Battery or simple electronics (e.g., calculators, recorders)',
    gradient: 'from-amber-500 to-orange-600',
    accentColor: 'amber'
  },
  {
    id: 'hi',
    label: 'High Tech',
    description: 'Complex devices requiring training (e.g., computers, software)',
    gradient: 'from-rose-500 to-pink-600',
    accentColor: 'rose'
  }
];

const initialCards: Card[] = [
  { id: 'c1', label: 'Reading guide', category: 'unsorted', correctCategories: ['lo'] },
  { id: 'c2', label: 'Spell checker', category: 'unsorted', correctCategories: ['hi'] },
  { id: 'c3', label: 'Text-to-speech', category: 'unsorted', correctCategories: ['hi'] },
  { id: 'c4', label: 'Graphic organizers', category: 'unsorted', correctCategories: ['lo', 'hi'] },
  { id: 'c5', label: 'Portable word processor', category: 'unsorted', correctCategories: ['mid'] },
  { id: 'c6', label: 'Audiobooks', category: 'unsorted', correctCategories: ['hi'] },
  { id: 'c7', label: 'Calculator', category: 'unsorted', correctCategories: ['mid'] },
  { id: 'c8', label: 'Pencil grips', category: 'unsorted', correctCategories: ['lo'] },
  { id: 'c9', label: 'Slant board', category: 'unsorted', correctCategories: ['lo'] },
  { id: 'c10', label: 'Voice recorder', category: 'unsorted', correctCategories: ['mid'] },
  { id: 'c11', label: 'Adapted keyboard', category: 'unsorted', correctCategories: ['hi'] },
  { id: 'c12', label: 'AAC communication', category: 'unsorted', correctCategories: ['lo', 'mid', 'hi'] },
  { id: 'c13', label: 'Visual timers', category: 'unsorted', correctCategories: ['mid'] },
  { id: 'c14', label: 'Peer buddy/partner support', category: 'unsorted', correctCategories: ['no'] },
  { id: 'c15', label: 'Single switch access', category: 'unsorted', correctCategories: ['hi'] },
  { id: 'c16', label: 'Preferential seating', category: 'unsorted', correctCategories: ['no'] },
  { id: 'c17', label: 'Chunk tasks', category: 'unsorted', correctCategories: ['no'] },
  { id: 'c18', label: 'Magnification', category: 'unsorted', correctCategories: ['lo', 'mid', 'hi'] },
  { id: 'c19', label: 'Artificial intelligence', category: 'unsorted', correctCategories: ['hi'] }
];

function App() {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [revealDialog, setRevealDialog] = useState<{ category: string; cards: Card[] } | null>(null);
  const [completionShown, setCompletionShown] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'images'>('info');
  const [cardFontSize, setCardFontSize] = useState(16);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructionsTab, setInstructionsTab] = useState<'overview' | 'howto'>('overview');
  const [instructionsFontSize, setInstructionsFontSize] = useState(16);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryFontSize, setCategoryFontSize] = useState(16);
  const [pageZoom, setPageZoom] = useState(100);
  const [mobileCategoryModal, setMobileCategoryModal] = useState<Card | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [touchDraggedCard, setTouchDraggedCard] = useState<string | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const pinchStartDistance = useRef<number | null>(null);
  const initialZoom = useRef<number>(100);
  const dragElementRef = useRef<HTMLDivElement | null>(null);
  const clickTimeoutRef = useRef<number | null>(null);
  const touchTimeoutRef = useRef<number | null>(null);
  const lastTouchTimeRef = useRef<number>(0);
  const doubleClickDelay = 300;
  const doubleTapDelay = 300;

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        e.stopPropagation();
        const distance = Math.sqrt(
          Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
          Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
        );
        pinchStartDistance.current = distance;
        initialZoom.current = pageZoom;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        e.stopPropagation();
        if (pinchStartDistance.current) {
          const distance = Math.sqrt(
            Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
            Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
          );
          const scale = distance / pinchStartDistance.current;
          const newZoom = Math.min(200, Math.max(50, initialZoom.current * scale));
          setPageZoom(Math.round(newZoom / 10) * 10);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (pinchStartDistance.current !== null) {
        e.preventDefault();
        e.stopPropagation();
      }
      pinchStartDistance.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, true);
      document.removeEventListener('touchmove', handleTouchMove, true);
      document.removeEventListener('touchend', handleTouchEnd, true);
    };
  }, [pageZoom]);

  useEffect(() => {
    const hasUnsorted = cards.some(c => c.category === 'unsorted');
    if (hasUnsorted && !isRunning) {
      setIsRunning(true);
      setCompletionShown(false);
    } else if (!hasUnsorted && isRunning) {
      setIsRunning(false);
      if (!completionShown) {
        setCompletionShown(true);
      }
    }
  }, [cards, isRunning, completionShown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCard(cardId);
  };

  const handleTouchStart = (e: React.TouchEvent, cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const now = Date.now();
    const timeSinceLastTouch = now - lastTouchTimeRef.current;

    // If this is a double-tap (within 300ms of last tap)
    if (timeSinceLastTouch < doubleTapDelay && timeSinceLastTouch > 0) {
      // Clear any pending single-tap timeout
      if (touchTimeoutRef.current) {
        window.clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
      // Open info modal on double-tap
      handleCardDoubleClick(card);
      lastTouchTimeRef.current = 0; // Reset to prevent triple-tap from triggering
    } else {
      // This is potentially a single tap, wait to see if there's a second tap
      lastTouchTimeRef.current = now;

      if (touchTimeoutRef.current) {
        window.clearTimeout(touchTimeoutRef.current);
      }

      touchTimeoutRef.current = window.setTimeout(() => {
        // Single tap confirmed - open category modal
        setMobileCategoryModal(card);
        touchTimeoutRef.current = null;
      }, doubleTapDelay);
    }
  };

  const handleCardClick = (e: React.MouseEvent, cardId: string) => {
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      return;
    }

    clickTimeoutRef.current = window.setTimeout(() => {
      const card = cards.find(c => c.id === cardId);
      if (card) {
        setMobileCategoryModal(card);
      }
      clickTimeoutRef.current = null;
    }, doubleClickDelay);
  };

  const handleCardDoubleClickEvent = (card: Card) => {
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    handleCardDoubleClick(card);
  };

  const handleDragHandleStart = (e: React.DragEvent, cardId: string) => {
    e.stopPropagation();
    setDraggedCard(cardId);

    const card = cards.find(c => c.id === cardId);
    if (card) {
      const dragImage = document.createElement('div');
      dragImage.className = 'px-5 py-4 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-500 shadow-2xl';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      dragImage.innerHTML = `
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400">
            <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
            <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
          </svg>
          <span class="text-white font-medium">${card.label}</span>
        </div>
      `;
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);

      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
  };

  const togglePresentationMode = () => {
    if (!isPresentationMode) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsPresentationMode(!isPresentationMode);
  };


  const handleMobileCategorySelect = (categoryId: string) => {
    if (mobileCategoryModal) {
      setCards(prev =>
        prev.map(card =>
          card.id === mobileCategoryModal.id ? { ...card, category: categoryId } : card
        )
      );
      setMobileCategoryModal(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverCategory(null);
  };

  const handleDragOver = (e: React.DragEvent, categoryId?: string) => {
    e.preventDefault();
    if (categoryId) {
      setDragOverCategory(categoryId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCategory(null);
  };

  const handleDrop = (categoryId: string) => {
    if (draggedCard) {
      setCards(prev =>
        prev.map(card =>
          card.id === draggedCard ? { ...card, category: categoryId } : card
        )
      );
      setDraggedCard(null);
      setDragOverCategory(null);
    }
  };

  const handleReset = () => {
    setCards(initialCards);
    setTimer(0);
    setIsRunning(false);
    setCompletionShown(false);
  };

  const handleExport = () => {
    const csv = ['Card,Category'];
    cards.forEach(card => {
      const cat = categories.find(c => c.id === card.category)?.label || 'Unsorted';
      csv.push(`"${card.label}","${cat}"`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'at-continuum-sort.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReveal = (categoryId: string) => {
    const categoryCards = cards.filter(c => c.category === categoryId);
    setRevealDialog({ category: categoryId, cards: categoryCards });
  };

  const handleCardDoubleClick = (card: Card) => {
    setSelectedCard(card);
    setActiveTab('info');
  };

  const getCardsForCategory = (categoryId: string) => {
    return cards.filter(c => c.category === categoryId);
  };

  const getCategoryAccentClasses = (accentColor: string, isCorrect: boolean = false) => {
    const colorMap: Record<string, { border: string; bg: string; bgHover: string; text: string; correctBorder: string }> = {
      emerald: {
        border: 'border-emerald-200',
        bg: 'bg-emerald-50',
        bgHover: 'hover:bg-emerald-100',
        text: 'text-emerald-700',
        correctBorder: 'border-emerald-500'
      },
      sky: {
        border: 'border-sky-200',
        bg: 'bg-sky-50',
        bgHover: 'hover:bg-sky-100',
        text: 'text-sky-700',
        correctBorder: 'border-sky-500'
      },
      amber: {
        border: 'border-amber-200',
        bg: 'bg-amber-50',
        bgHover: 'hover:bg-amber-100',
        text: 'text-amber-700',
        correctBorder: 'border-amber-500'
      },
      rose: {
        border: 'border-rose-200',
        bg: 'bg-rose-50',
        bgHover: 'hover:bg-rose-100',
        text: 'text-rose-700',
        correctBorder: 'border-rose-500'
      }
    };
    const colors = colorMap[accentColor] || colorMap.emerald;
    return {
      ...colors,
      border: isCorrect ? colors.correctBorder : colors.border
    };
  };

  const unsortedCards = cards.filter(c => c.category === 'unsorted');
  const allSorted = unsortedCards.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

      <div className="relative" style={{ zoom: `${isPresentationMode ? 110 : pageZoom}%` }}>
        <header className={`border-b border-white/10 backdrop-blur-xl bg-white/5 ${isPresentationMode ? 'py-4' : ''}`}>
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isPresentationMode ? 'py-4' : 'py-8'}`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="mb-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    AT Continuum Sort
                  </h1>
                </div>
                <p className="text-slate-400 text-lg">Classify assistive technology by complexity level</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 px-5 py-3 rounded-xl shadow-lg">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <span className="font-mono text-2xl font-bold text-white tracking-wider">{formatTime(timer)}</span>
                </div>
                <button
                  onClick={() => setShowInstructions(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="font-medium">Instructions</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="font-medium">Reset</span>
                </button>
                <button
                  onClick={togglePresentationMode}
                  className="flex items-center gap-2 px-5 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {isPresentationMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span className="font-medium">{isPresentationMode ? 'Exit' : 'Present'}</span>
                </button>
                <div className="fixed bottom-6 right-6 z-40 lg:static flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => setPageZoom(prev => Math.min(200, prev + 10))}
                    className="px-4 py-3 text-white hover:bg-white/10 transition-all duration-200"
                    title="Zoom in"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPageZoom(prev => Math.max(50, prev - 10))}
                    className="px-4 py-3 text-white hover:bg-white/10 transition-all duration-200 border-l border-white/10"
                    title="Zoom out"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="mb-5">
            <div
              className={`backdrop-blur-sm border-2 rounded-2xl p-8 min-h-[140px] transition-all duration-300 ${
                dragOverCategory === 'unsorted'
                  ? 'bg-white/10 border-white/30 shadow-2xl scale-[1.02]'
                  : 'bg-white/5 border-white/10 border-dashed shadow-lg'
              }`}
              data-category-id="unsorted"
              onDragOver={(e) => handleDragOver(e, 'unsorted')}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop('unsorted')}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
                <h2 className="text-2xl font-bold text-white">Unsorted Cards</h2>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold text-slate-300 border border-white/20">
                  {unsortedCards.length} remaining
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {allSorted ? (
                  <div className="w-full text-center py-8">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold text-lg">All cards sorted! Great work!</span>
                    </div>
                  </div>
                ) : (
                  unsortedCards.map(card => (
                    <div
                      key={card.id}
                      className={`group relative px-5 py-4 rounded-xl transition-all duration-200 ${
                        draggedCard === card.id
                          ? 'opacity-50 scale-95'
                          : 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-slate-500 hover:scale-105 hover:shadow-xl shadow-lg'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          draggable
                          onDragStart={(e) => handleDragHandleStart(e, card.id)}
                          onDragEnd={handleDragEnd}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                        </div>
                        <span
                          className="text-white font-medium select-none cursor-pointer flex-1"
                          onClick={(e) => handleCardClick(e, card.id)}
                          onDoubleClick={() => handleCardDoubleClickEvent(card)}
                          onTouchStart={(e) => handleTouchStart(e, card.id)}
                        >{card.label}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-5">
            {categories.map(category => {
              const categoryCards = getCardsForCategory(category.id);
              const isDragOver = dragOverCategory === category.id;

              return (
                <div
                  key={category.id}
                  className={`backdrop-blur-sm border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                    isDragOver
                      ? 'bg-white/10 border-white/30 shadow-2xl scale-[1.02]'
                      : 'bg-white/5 border-white/10 shadow-lg hover:shadow-xl'
                  }`}
                  data-category-id={category.id}
                  onDragOver={(e) => handleDragOver(e, category.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(category.id)}
                >
                  <div
                    className={`bg-gradient-to-r ${category.gradient} px-5 py-4 relative overflow-hidden cursor-pointer hover:brightness-110 transition-all duration-200`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
                    <div className="relative flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">{category.label}</h3>
                      <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-bold text-white border border-white/30">
                        {categoryCards.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-slate-400 leading-relaxed mb-5 min-h-[4rem]">{category.description}</p>
                    <div className="space-y-2.5 min-h-[220px] mb-4">
                      {categoryCards.map(card => {
                        const isCorrect = card.correctCategories.includes(category.id);
                        const accentClasses = getCategoryAccentClasses(category.accentColor, isCorrect);

                        return (
                          <div
                            key={card.id}
                            className={`group relative px-4 py-3 rounded-xl transition-all duration-200 ${
                              draggedCard === card.id
                                ? 'opacity-50 scale-95'
                                : isCorrect
                                  ? `${accentClasses.bg} ${accentClasses.border} border-2 ${accentClasses.bgHover} hover:shadow-md shadow-sm`
                                  : 'bg-slate-700/50 border-slate-600 border-2 hover:bg-slate-700 hover:shadow-md shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                draggable
                                onDragStart={(e) => handleDragHandleStart(e, card.id)}
                                onDragEnd={handleDragEnd}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className={`w-3.5 h-3.5 ${isCorrect ? 'text-slate-400 group-hover:text-slate-600' : 'text-slate-500 group-hover:text-slate-400'}`} />
                              </div>
                              <span
                                className={`${isCorrect ? accentClasses.text : 'text-slate-200'} text-sm font-semibold select-none cursor-pointer flex-1`}
                                onClick={(e) => handleCardClick(e, card.id)}
                                onDoubleClick={() => handleCardDoubleClickEvent(card)}
                                onTouchStart={(e) => handleTouchStart(e, card.id)}
                              >{card.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 font-semibold group"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Export Answers
              </button>
              <a
                href="https://assistivetechnology.mystrikingly.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 font-semibold group"
              >
                <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                AT Gallery
              </a>
              <a
                href="https://sites.google.com/view/tlc-at/home"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 font-semibold group"
              >
                <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Assistive Technology and the IEP
              </a>
            </div>
            <p className="text-center text-slate-400 text-sm">
              Created by the{' '}
              <a
                href="https://www.tlc-mtss.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 underline"
              >
                Technology & Learning Connections Team
              </a>
              .
            </p>
          </div>
        </main>
      </div>

      {revealDialog && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setRevealDialog(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-gradient-to-r ${categories.find(c => c.id === revealDialog.category)?.gradient} px-6 py-5 rounded-t-2xl relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
              <h3 className="relative text-2xl font-bold text-white drop-shadow-lg">
                {categories.find(c => c.id === revealDialog.category)?.label}
              </h3>
            </div>
            <div className="p-6">
              {revealDialog.cards.length === 0 ? (
                <p className="text-slate-400 text-center py-8 italic">No cards in this category yet.</p>
              ) : (
                <ul className="space-y-2.5 max-h-[400px] overflow-y-auto">
                  {revealDialog.cards.map((card, index) => (
                    <li
                      key={card.id}
                      className="bg-slate-700/50 backdrop-blur-sm border border-slate-600 px-5 py-3 rounded-xl text-white font-medium flex items-center gap-3 hover:bg-slate-700 transition-colors"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-600 text-xs font-bold text-slate-300">
                        {index + 1}
                      </span>
                      {card.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setRevealDialog(null)}
                className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedCard(null)}>
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-2 p-4 border-b border-slate-700">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
                  activeTab === 'info'
                    ? 'bg-blue-600 text-white border border-blue-500 shadow-lg shadow-blue-500/30'
                    : 'bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 hover:text-white'
                }`}
              >
                <Info className="w-4 h-4" />
                Info
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
                  activeTab === 'images'
                    ? 'bg-blue-600 text-white border border-blue-500 shadow-lg shadow-blue-500/30'
                    : 'bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 hover:text-white'
                }`}
              >
                Images
              </button>
              <button
                onClick={() => setCardFontSize(prev => Math.min(prev + 2, 32))}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg transition-all duration-200 font-semibold"
                title="Increase font size"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCardFontSize(prev => Math.max(prev - 2, 12))}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg transition-all duration-200 font-semibold"
                title="Decrease font size"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCardFontSize(16)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg transition-all duration-200 font-semibold"
                title="Reset to default font size"
              >
                Restore
              </button>
              <button
                onClick={() => {
                  setCardFontSize(16);
                  setSelectedCard(null);
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg transition-all duration-200 font-semibold ml-auto"
              >
                Close
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1" style={{ fontSize: `${cardFontSize}px` }}>
              <h3 className="text-2xl font-bold text-white mb-4">{selectedCard.label}</h3>
              {activeTab === 'info' && (
                <div className="text-slate-300 leading-relaxed space-y-4">
                  {cardInformation[selectedCard.label] ? (
                    cardInformation[selectedCard.label].split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-slate-400 italic">No information available for this card.</p>
                  )}
                </div>
              )}
              {activeTab === 'images' && (
                <div className="text-center py-12">
                  <p className="text-slate-300 mb-6">
                    Click the button below and a new window will open with relevant images from Google Image Search
                  </p>
                  <a
                    href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(imageSearchQueries[selectedCard.label] || selectedCard.label)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Open Google Image Search
                  </a>
                  {imageSearchQueries[selectedCard.label] && (
                    <p className="text-slate-400 text-sm mt-4">
                      Search: "{imageSearchQueries[selectedCard.label]}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowInstructions(false)}>
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-2 p-4 border-b border-slate-700">
              <button
                onClick={() => setInstructionsTab('overview')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
                  instructionsTab === 'overview'
                    ? 'bg-blue-600 text-white border border-blue-500 shadow-lg shadow-blue-500/30'
                    : 'bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setInstructionsTab('howto')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
                  instructionsTab === 'howto'
                    ? 'bg-blue-600 text-white border border-blue-500 shadow-lg shadow-blue-500/30'
                    : 'bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 hover:text-white'
                }`}
              >
                How-to-play
              </button>
              <button
                onClick={() => setInstructionsFontSize(prev => Math.min(prev + 2, 24))}
                className="flex items-center justify-center w-10 h-10 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg transition-all duration-200"
                title="Increase font size"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setInstructionsFontSize(prev => Math.max(prev - 2, 12))}
                className="flex items-center justify-center w-10 h-10 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg transition-all duration-200"
                title="Decrease font size"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setInstructionsFontSize(16);
                  setShowInstructions(false);
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg transition-all duration-200 font-semibold ml-auto"
              >
                Close
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1" style={{ fontSize: `${instructionsFontSize}px` }}>
              {instructionsTab === 'overview' && (
                <div className="text-slate-300 leading-relaxed space-y-4">
                  <h3 className="text-2xl font-bold text-white mb-4">Overview</h3>
                  <p>
                    Assistive technology (AT) exists on a continuum, ranging from simple environmental supports to advanced digital systems. This framework helps educators, therapists, and families match tools and strategies to each learner's unique needs—starting with the least complex, most accessible options and progressing toward more specialized solutions when needed. The four main levels—<span className="font-bold text-white">No Tech, Low Tech, Mid Tech, and High Tech</span>—illustrate how supports can scale in both sophistication and cost while maintaining a shared goal: enabling access, independence, and participation in learning and daily life.
                  </p>
                  <h4 className="text-xl font-bold text-white mt-6 mb-3">The Four Categories</h4>
                  <div className="space-y-3">
                    <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-4">
                      <h5 className="font-bold text-emerald-300 mb-2">No Tech</h5>
                      <p className="text-sm">Support strategy accommodations that require no technology, like prompting, preferential seating, etc. While these supports are not assistive technologies, they are included in this continuum to illustrate how accommodation strategies and AT can work together.</p>
                    </div>
                    <div className="bg-sky-900/30 border border-sky-700/50 rounded-lg p-4">
                      <h5 className="font-bold text-sky-300 mb-2">Low Tech</h5>
                      <p className="text-sm">Simple items with few or no moving parts (e.g., slant boards, highlighters, pencil grips).</p>
                    </div>
                    <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4">
                      <h5 className="font-bold text-amber-300 mb-2">Mid Tech</h5>
                      <p className="text-sm">Battery-operated or simple electronic devices like calculators, voice recorders, or visual timers.</p>
                    </div>
                    <div className="bg-rose-900/30 border border-rose-700/50 rounded-lg p-4">
                      <h5 className="font-bold text-rose-300 mb-2">High Tech</h5>
                      <p className="text-sm">Complex devices requiring training, such as computers, tablets, specialized software, or communication devices.</p>
                    </div>
                  </div>
                  <p className="mt-6">
                    Some assistive technologies can fit into multiple categories depending on their implementation. For example, graphic organizers can be paper-based (Low Tech) or digital (High Tech).
                  </p>
                </div>
              )}
              {instructionsTab === 'howto' && (
                <div className="text-slate-300 leading-relaxed space-y-4">
                  <h3 className="text-2xl font-bold text-white mb-4">How to Play</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">1. Move Cards to Categories</h4>
                      <p className="mb-2">
                        <strong className="text-white">Desktop:</strong> Click and drag the grip icon (six dots) on the left side of any card to move it to a category, <strong className="text-white">OR</strong> single-click on a card's text to open a choice window.
                      </p>
                      <p>
                        <strong className="text-white">Mobile:</strong> Tap on a card's text to open a choice window.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">2. Learn About Each Tool</h4>
                      <p className="mb-2">
                        <strong className="text-white">Desktop:</strong> Double-click on any card's text to open a detailed information window.
                      </p>
                      <p>
                        <strong className="text-white">Mobile:</strong> Double-tap on any card's text to open a detailed information window.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">3. Learn About Categories</h4>
                      <p>
                        Click/tap on any category header (the colored section at the top of each category) to learn more about that technology level. This will show you detailed information about what defines each category, with examples and explanations.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">4. Check Your Progress</h4>
                      <p>
                        Cards that are correctly placed will be highlighted with a colored border matching their category. The timer at the top tracks how long it takes you to sort all cards.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">5. View Category Contents</h4>
                      <p>
                        As you sort cards into categories, they will appear in the colored category sections below.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">6. Reset and Try Again</h4>
                      <p>
                        Use the "Reset" button at the top to return all cards to the unsorted area and start fresh. The "Export Answers" button at the bottom lets you save your sorting results as a CSV file.
                      </p>
                    </div>
                    <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mt-6">
                      <h5 className="font-bold text-blue-300 mb-2">Tip</h5>
                      <p className="text-sm">
                        Remember that some tools can belong to multiple categories! If you're unsure, double-click or double-tap to read more about it before making your decision.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedCategory(null)}>
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-2 p-4 border-b border-slate-700">
              <button
                onClick={() => setCategoryFontSize(prev => Math.min(prev + 2, 32))}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg transition-all duration-200 font-semibold"
                title="Increase font size"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCategoryFontSize(prev => Math.max(prev - 2, 12))}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg transition-all duration-200 font-semibold"
                title="Decrease font size"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCategoryFontSize(16);
                  setSelectedCategory(null);
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg transition-all duration-200 font-semibold ml-auto"
              >
                Close
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1" style={{ fontSize: `${categoryFontSize}px` }}>
              <div className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${selectedCategory.gradient} text-white font-bold mb-4`}>
                {selectedCategory.label}
              </div>
              <div className="text-slate-300 leading-relaxed space-y-4">
                {categoryInformation[selectedCategory.label] ? (
                  categoryInformation[selectedCategory.label].split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p className="text-slate-400 italic">No information available for this category.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {mobileCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4" onClick={() => setMobileCategoryModal(null)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-sm animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-1">Move Card</h3>
              <p className="text-slate-400 text-sm mb-4 truncate">{mobileCategoryModal.label}</p>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleMobileCategorySelect(category.id)}
                    className={`w-full px-4 py-3 rounded-lg font-bold text-white text-sm transition-all duration-200 bg-gradient-to-r ${category.gradient} active:brightness-110 active:scale-95 shadow-md`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setMobileCategoryModal(null)}
                className="w-full mt-3 px-4 py-2 bg-slate-700 active:bg-slate-600 border border-slate-600 text-white text-sm rounded-lg transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {touchDraggedCard && (
        <div
          ref={dragElementRef}
          className="fixed pointer-events-none z-[100] px-5 py-4 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-500 shadow-2xl"
          style={{
            transform: 'translate(-50%, -50%)',
            opacity: 0.9
          }}
        >
          <div className="flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-slate-400" />
            <span className="text-white font-medium">
              {cards.find(c => c.id === touchDraggedCard)?.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
