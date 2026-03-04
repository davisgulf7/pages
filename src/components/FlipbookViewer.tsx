import React, { useState, useRef, useEffect } from 'react';
import { Upload, ChevronLeft, ChevronRight, X } from 'lucide-react';

declare global {
    interface Window {
        pdfjsLib: any;
        $: any;
    }
}

export default function FlipbookViewer() {
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isViewerActive, setIsViewerActive] = useState(false);

    const dropZoneRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const flipbookRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const ratioRef = useRef<number>(1.6); // Default aspect ratio (960/600)

    useEffect(() => {
        // Check if libraries are loaded
        if (!window.pdfjsLib) {
            console.warn("pdf.js not loaded yet");
        } else {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/lib/pdf.worker.min.js';
        }
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropZoneRef.current) dropZoneRef.current.classList.add('bg-white/20', 'border-white/50');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropZoneRef.current) dropZoneRef.current.classList.remove('bg-white/20', 'border-white/50');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropZoneRef.current) dropZoneRef.current.classList.remove('bg-white/20', 'border-white/50');

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const processFiles = async (fileList: FileList) => {
        if (fileList.length === 0) return;
        setError('');
        setLoading(true);
        setLoadingMessage('Processing files...');
        setIsViewerActive(true);

        const filesArray = Array.from(fileList).sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
        );

        try {
            if (filesArray[0].type === 'application/pdf') {
                setLoadingMessage('Parsing PDF pages...');
                await loadPDF(filesArray[0]);
            } else {
                setLoadingMessage('Loading images...');
                await loadImages(filesArray);
            }

            initFlipbook();
            setLoading(false);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error processing files');
            setLoading(false);
            setIsViewerActive(false);
        }
    };

    const loadPDF = async (file: File) => {
        if (!window.pdfjsLib) throw new Error("PDF parser not initialized. Please refresh.");

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        if (flipbookRef.current) flipbookRef.current.innerHTML = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            setLoadingMessage(`Rendering page ${i} of ${pdf.numPages}...`);
            const page = await pdf.getPage(i);

            if (i === 1) {
                const viewport = page.getViewport({ scale: 1 });
                ratioRef.current = (viewport.width / viewport.height) * 2;
            }

            const scale = 2; // High quality
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            addPage(imgData);
        }
    };

    const loadImages = async (files: File[]) => {
        if (flipbookRef.current) flipbookRef.current.innerHTML = '';

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;

            setLoadingMessage(`Loading image ${i + 1} of ${files.length}...`);
            const dataUrl = await readFileAsDataURL(file);

            if (i === 0) {
                const img = new window.Image();
                img.src = dataUrl;
                await new Promise(r => img.onload = r);
                ratioRef.current = (img.width / img.height) * 2;
            }
            addPage(dataUrl);
        }
    };

    const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const addPage = (src: string) => {
        if (!flipbookRef.current) return;

        const div = document.createElement('div');
        div.className = 'page relative bg-white shadow-inner';
        div.style.backgroundImage = `url(${src})`;
        div.style.backgroundSize = '100% 100%';

        const gradient = document.createElement('div');
        gradient.className = 'absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/10 pointer-events-none';
        div.appendChild(gradient);

        flipbookRef.current.appendChild(div);
    };

    const calculateSize = () => {
        if (!containerRef.current) return { width: 800, height: 600 };

        const margin = 40;
        const maxWidth = containerRef.current.clientWidth - margin;
        let maxHeight = window.innerHeight - 200;

        let width = maxWidth;
        let height = width / ratioRef.current;

        if (height > maxHeight) {
            height = maxHeight;
            width = height * ratioRef.current;
        }

        width = Math.floor(width / 2) * 2;
        return { width, height };
    };

    const initFlipbook = () => {
        if (!flipbookRef.current || !window.$) return;

        const $flipbook = window.$(flipbookRef.current);

        if ($flipbook.turn('is')) {
            $flipbook.turn('destroy');
        }

        const size = calculateSize();

        $flipbook.turn({
            width: size.width,
            height: size.height,
            autoCenter: true,
            duration: 1000,
            gradients: true,
            acceleration: true,
            elevation: 50,
            cornerSize: 100,
            when: {
                turning: (_e: any, page: number, _view: any) => {
                    setCurrentPage(page);
                },
                turned: (_e: any, page: number, _view: any) => {
                    setCurrentPage(page);
                    setPageCount($flipbook.turn('pages'));
                }
            }
        });

        setPageCount($flipbook.turn('pages'));
        setCurrentPage(1);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') $flipbook.turn('previous');
            if (e.key === 'ArrowRight') $flipbook.turn('next');
        };

        window.addEventListener('keydown', handleKeyDown);

        const handleResize = () => {
            if ($flipbook.turn('is')) {
                const newSize = calculateSize();
                $flipbook.turn('size', newSize.width, newSize.height);
            }
        };
        window.addEventListener('resize', handleResize);
    };

    const goPrev = () => {
        if (window.$ && flipbookRef.current) {
            window.$(flipbookRef.current).turn('previous');
        }
    };

    const goNext = () => {
        if (window.$ && flipbookRef.current) {
            window.$(flipbookRef.current).turn('next');
        }
    };

    const closeViewer = () => {
        setIsViewerActive(false);
        if (window.$ && flipbookRef.current && window.$(flipbookRef.current).turn('is')) {
            window.$(flipbookRef.current).turn('destroy');
        }
        if (flipbookRef.current) flipbookRef.current.innerHTML = '';
    };

    return (
        <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">

            {!isViewerActive ? (
                <div
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-2xl aspect-video rounded-3xl backdrop-blur-md bg-white/10 border-2 border-white/20 border-dashed shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white/20 hover:scale-[1.02] group p-8"
                >
                    <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Upload className="w-10 h-10 text-blue-300" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-3">Upload your PDF or Images</h3>
                    <p className="text-blue-100/70 text-center text-lg max-w-md">
                        Drag and drop your files here, or click to browse. We'll instantly transform them into a beautiful, interactive flipbook.
                    </p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
                        }}
                    />
                    {error && (
                        <div className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-full flex-1 flex flex-col items-center animate-in fade-in duration-500">

                    {/* Header Controls */}
                    <div className="w-full flex justify-between items-center px-6 py-4 mb-4">
                        <button
                            onClick={closeViewer}
                            className="px-4 py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-white rounded-xl backdrop-blur-sm border border-white/10 transition-all flex items-center gap-2"
                        >
                            <X className="w-5 h-5" />
                            Close Book
                        </button>

                        {!loading && pageCount > 0 && (
                            <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl shadow-lg">
                                <button
                                    onClick={goPrev}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft className="w-6 h-6 text-white" />
                                </button>
                                <span className="text-white font-mono text-lg font-bold min-w-[5rem] text-center tracking-widest">
                                    {currentPage} <span className="text-white/50">/</span> {pageCount}
                                </span>
                                <button
                                    onClick={goNext}
                                    disabled={currentPage === pageCount}
                                    className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        )}

                        <div className="w-[110px]" /> {/* Spacer for centering */}
                    </div>

                    <div ref={containerRef} className="w-full flex-1 flex items-center justify-center relative min-h-[500px]">
                        {loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 backdrop-blur-sm bg-slate-900/50 rounded-3xl border border-white/10">
                                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-400 rounded-full animate-spin mb-6"></div>
                                <h3 className="text-2xl font-bold text-white mb-2">{loadingMessage}</h3>
                                <p className="text-blue-200/70">Building your immersive experience...</p>
                            </div>
                        )}

                        <div className={`transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'} shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]`} ref={flipbookRef}>
                            {/* Pages rendered by Turn.js */}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
