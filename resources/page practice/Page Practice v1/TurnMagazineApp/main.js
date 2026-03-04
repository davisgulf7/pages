/* main.js */

// Worker setup for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.min.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const flipbookEl = document.getElementById('flipbook');
const container = document.getElementById('flipbook-container');
const controls = document.getElementById('controls');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');

// Drag & Drop Events
// Drag & Drop Events
// Prevent default behavior for the whole window to stop browser from opening files
window.addEventListener('dragover', function (e) {
    e.preventDefault();
}, false);
window.addEventListener('drop', function (e) {
    e.preventDefault();
}, false);

dropZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only remove class if we are leaving the dropzone itself, not entering a child
    if (!dropZone.contains(e.relatedTarget)) {
        dropZone.classList.remove('dragover');
    }
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
    console.log("File dropped", e.dataTransfer.files);
    handleFiles(e.dataTransfer.files);
});

dropZone.addEventListener('click', () => {
    console.log("Dropzone clicked");
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    console.log("File input changed", e.target.files);
    handleFiles(e.target.files);
});

async function handleFiles(files) {
    if (files.length === 0) return;

    // Show loading state
    dropZone.innerHTML = '<div class="drop-message"><span>Processing...</span></div>';

    // Clear previous state
    const $flipbook = $(flipbookEl);
    if ($flipbook.turn('is')) {
        $flipbook.turn('destroy');
        $(window).unbind('keydown'); // Remove old key listeners
    }
    flipbookEl.innerHTML = '';
    flipbookEl.style.width = '';
    flipbookEl.style.height = '';

    // Sort files by name if multiple images
    const fileList = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    try {
        if (fileList[0].type === 'application/pdf') {
            await loadPDF(fileList[0]);
        } else {
            await loadImages(fileList);
        }

        initializeFlipbook();

        // UI Transition
        dropZone.classList.add('hidden');
        container.classList.remove('hidden');
        controls.classList.remove('hidden');

    } catch (err) {
        console.error(err);
        dropZone.innerHTML = `<div class="drop-message"><span style="color:#ff6b6b">Error: ${err.message}</span></div>`;
        setTimeout(() => {
            dropZone.innerHTML = `
                <div class="drop-message">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" class="upload-icon">
                        <path d="M12 16L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9 11L12 8 15 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 16H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M3 9C3 6.643 3.643 4.5 5.5 3C7.357 1.5 9.643 1 12 1C14.357 1 16.643 1.5 18.5 3C20.357 4.5 21 6.643 21 9V17C21 19.357 20.357 21.5 18.5 23C16.643 24.5 14.357 25 12 25C9.643 25 7.357 24.5 5.5 23C3.643 21.5 3 19.357 3 17V9Z" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>Drop Here</span>
                </div>
             `;
        }, 2000);
    }
}

async function loadPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 1.5; // Good quality
        const viewport = page.getViewport({ scale: scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        addPage(imgData);
    }
}

async function loadImages(files) {
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const dataUrl = await readFileAsDataURL(file);
        addPage(dataUrl);
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function addPage(src) {
    const div = document.createElement('div');
    div.className = 'page';
    div.style.backgroundImage = `url(${src})`;

    // Add gradient overlay for realism (handled by turn.js partially, but we can enhance)
    const gradient = document.createElement('div');
    gradient.className = 'gradient';
    div.appendChild(gradient);

    flipbookEl.appendChild(div);
}

function initializeFlipbook() {
    const $flipbook = $(flipbookEl);

    // Calculate aspect ratio from first page
    // Note: In a real app we might want to wait for image load or use PDF viewport
    // For now assuming A4ish or screen size
    const width = 960;
    const height = 600;

    $flipbook.turn({
        width: width,
        height: height,
        autoCenter: true,
        duration: 1000,
        gradients: true,
        acceleration: true,
        elevation: 50,
        cornerSize: 100, // Make it easier to turn
        when: {
            turning: function (e, page, view) {
                updateControls(page, $(this).turn('pages'));
            },
            turned: function (e, page, view) {
                updateControls(page, $(this).turn('pages'));
            }
        }
    });

    // Initial controls state
    updateControls(1, $flipbook.turn('pages'));

    // Keyboard support
    $(document).keydown(function (e) {
        if (e.keyCode == 37) $flipbook.turn('previous');
        else if (e.keyCode == 39) $flipbook.turn('next');
    });

    // Control buttons
    prevBtn.onclick = () => $flipbook.turn('previous');
    nextBtn.onclick = () => $flipbook.turn('next');
}

function updateControls(page, total) {
    pageInfo.innerText = `${page} / ${total}`;
    prevBtn.disabled = page === 1;
    nextBtn.disabled = page === total;
    prevBtn.style.opacity = page === 1 ? 0.3 : 1;
    nextBtn.style.opacity = page === total ? 0.3 : 1;
}
