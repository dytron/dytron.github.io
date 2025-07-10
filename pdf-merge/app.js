import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/modular/sortable.esm.js';
import { mergePdfs } from './modules/pdfMerge.js';
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const mergeBtn = document.getElementById("mergeBtn");
const status = document.getElementById("status");

let pdfFiles = [];

async function renderPdfPreview(file, canvasElement) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1 });

  const context = canvasElement.getContext("2d");
  canvasElement.width = viewport.width;
  canvasElement.height = viewport.height;

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  return pdf.numPages;
}


async function renderFileList() {
  fileList.innerHTML = "";

  // Map promises for each file rendering
  const fileItems = await Promise.all(pdfFiles.map(async (file, i) => {
    const li = document.createElement("li");
    li.className = "file-item";
    li.dataset.index = i;

    const previewWrapper = document.createElement("div");
    previewWrapper.className = "preview-wrapper";

    const previewCanvas = document.createElement("canvas");
    previewCanvas.className = "pdf-preview";

    const pageCount = await renderPdfPreview(file, previewCanvas);

    const removeBtn = document.createElement("button");
    removeBtn.className = "file-btn";
    removeBtn.title = "Remove file";
    removeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 6h18v2H3V6zm2 3h14v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9zm5 3v6h2v-6H10zm4 0v6h2v-6h-2z"/>
      </svg>
    `;
    removeBtn.addEventListener("click", () => {
      pdfFiles.splice(i, 1);
      updateUI();
    });

    previewWrapper.appendChild(previewCanvas);
    previewWrapper.appendChild(removeBtn);

    const nameSpan = document.createElement("span");
    nameSpan.className = "file-name";
    nameSpan.textContent = file.name;

    const pageSpan = document.createElement("span");
    pageSpan.className = "file-pages";
    pageSpan.textContent = `${pageCount} page${pageCount > 1 ? "s" : ""}`;

    const infoDiv = document.createElement("div");
    infoDiv.className = "file-info";
    infoDiv.appendChild(nameSpan);
    infoDiv.appendChild(pageSpan);

    li.appendChild(previewWrapper);
    li.appendChild(infoDiv);

    return li;
  }));

  // Append all items at once after rendering previews
  fileItems.forEach(li => fileList.appendChild(li));

  mergeBtn.disabled = pdfFiles.length === 0;
}


async function updateUI() {
  await renderFileList();
  status.textContent = "";

  if (sortable) sortable.destroy();

  sortable = Sortable.create(fileList, {
    animation: 150,
    onEnd: (evt) => {
      const { oldIndex, newIndex } = evt;
      if (oldIndex === newIndex) return;

      const [movedFile] = pdfFiles.splice(oldIndex, 1);
      pdfFiles.splice(newIndex, 0, movedFile);

      updateUI();
    },
  });
}



// Initialize SortableJS on the list
let sortable = Sortable.create(fileList, {
  animation: 150,
  onEnd: (evt) => {
    const { oldIndex, newIndex } = evt;
    if (oldIndex === newIndex) return;

    // Reorder the pdfFiles array according to the movement
    const [movedFile] = pdfFiles.splice(oldIndex, 1);
    pdfFiles.splice(newIndex, 0, movedFile);

    updateUI();
  },
});

fileInput.addEventListener("change", (e) => {
  pdfFiles.push(...e.target.files);
  updateUI();
  fileInput.value = "";
});

mergeBtn.addEventListener("click", async () => {
  status.textContent = "Merging PDFs... please wait.";
  mergeBtn.disabled = true;

  try {
    const mergedPdfBytes = await mergePdfs(pdfFiles);
    const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "merged-pdf.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
    status.textContent = "PDFs merged successfully!";
  } catch (err) {
    console.error(err);
    status.textContent = "Error merging PDFs.";
  } finally {
    mergeBtn.disabled = false;
  }
});

// Drag & Drop support
const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('click', () => {
  fileInput.click();
});

dropZone.addEventListener('dragover', (e) => {
  const hasFiles = [...e.dataTransfer.types].includes('Files');
  if (hasFiles) {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  }
});

dropZone.addEventListener('dragleave', (e) => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', async (e) => {
  const hasFiles = [...e.dataTransfer.types].includes('Files');
  if (!hasFiles) return;

  e.preventDefault();
  dropZone.classList.remove('drag-over');

  const droppedFiles = Array.from(e.dataTransfer.files);
  const pdfDroppedFiles = droppedFiles.filter(file => file.type === 'application/pdf');

  if (pdfDroppedFiles.length > 0) {
    pdfFiles.push(...pdfDroppedFiles);
    await updateUI();
  }
});
