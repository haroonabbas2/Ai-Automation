// MHTML to HTML Converter - Main Application Logic

class MHTMLConverter {
    constructor() {
        this.files = [];
        this.convertedFiles = [];
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.browseBtn = document.getElementById('browseBtn');
        this.uploadSection = document.getElementById('uploadSection');
        this.fileListSection = document.getElementById('fileListSection');
        this.fileList = document.getElementById('fileList');
        this.fileCount = document.getElementById('fileCount');
        this.addMoreBtn = document.getElementById('addMoreBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.convertBtn = document.getElementById('convertBtn');
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsList = document.getElementById('resultsList');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.startOverBtn = document.getElementById('startOverBtn');
    }

    initEventListeners() {
        // Drop zone events
        this.dropZone.addEventListener('click', () => this.fileInput.click());
        this.browseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.fileInput.click();
        });

        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('drag-over');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files).filter(f =>
                f.name.endsWith('.mhtml') || f.name.endsWith('.mht')
            );
            this.addFiles(files);
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.addFiles(files);
            this.fileInput.value = '';
        });

        // Buttons
        this.addMoreBtn.addEventListener('click', () => this.fileInput.click());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        this.convertBtn.addEventListener('click', () => this.convertAll());
        this.downloadAllBtn.addEventListener('click', () => this.downloadAllAsZip());
        this.startOverBtn.addEventListener('click', () => this.startOver());
    }

    addFiles(newFiles) {
        if (newFiles.length === 0) {
            alert('Please select .mhtml or .mht files only.');
            return;
        }
        this.files.push(...newFiles);
        this.updateFileList();
        this.showFileList();
    }

    removeFile(index) {
        this.files.splice(index, 1);
        if (this.files.length === 0) {
            this.hideFileList();
        } else {
            this.updateFileList();
        }
    }

    clearAll() {
        this.files = [];
        this.hideFileList();
    }

    updateFileList() {
        this.fileCount.textContent = this.files.length;
        this.fileList.innerHTML = this.files.map((file, index) => `
            <div class="file-item">
                <div class="file-item-info">
                    <span class="file-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </span>
                    <span class="file-name" title="${file.name}">${file.name}</span>
                </div>
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <span class="file-size">${this.formatSize(file.size)}</span>
                    <button class="file-remove" onclick="converter.removeFile(${index})" title="Remove">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    showFileList() {
        this.uploadSection.querySelector('.drop-zone').style.padding = '1.5rem';
        this.uploadSection.querySelector('.drop-zone h3').style.fontSize = '1rem';
        this.fileListSection.style.display = 'block';
    }

    hideFileList() {
        this.fileListSection.style.display = 'none';
        this.uploadSection.querySelector('.drop-zone').style.padding = '3rem 2rem';
        this.uploadSection.querySelector('.drop-zone h3').style.fontSize = '1.3rem';
    }

    async convertAll() {
        if (this.files.length === 0) return;

        this.convertedFiles = [];
        this.uploadSection.style.display = 'none';
        this.fileListSection.style.display = 'none';
        this.progressSection.style.display = 'block';
        this.resultsSection.style.display = 'none';

        const total = this.files.length;

        for (let i = 0; i < total; i++) {
            const file = this.files[i];
            try {
                const htmlContent = await this.convertMHTMLtoHTML(file);
                const htmlFileName = file.name.replace(/\.(mhtml|mht)$/i, '.html');
                this.convertedFiles.push({
                    name: htmlFileName,
                    content: htmlContent,
                    originalName: file.name
                });
            } catch (error) {
                console.error(`Error converting ${file.name}:`, error);
                this.convertedFiles.push({
                    name: file.name.replace(/\.(mhtml|mht)$/i, '.html'),
                    content: `<html><body><h1>Error Converting File</h1><p>Could not convert ${file.name}: ${error.message}</p></body></html>`,
                    originalName: file.name,
                    error: true
                });
            }

            const progress = ((i + 1) / total) * 100;
            this.progressFill.style.width = `${progress}%`;
            this.progressText.textContent = `${i + 1} / ${total} files converted`;

            // Small delay for UI update
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        this.showResults();
    }

    async convertMHTMLtoHTML(file) {
        const text = await file.text();
        return this.parseMHTML(text);
    }

    parseMHTML(mhtmlContent) {
        // Find the boundary marker
        const boundaryMatch = mhtmlContent.match(/boundary="([^"]+)"/i) ||
                              mhtmlContent.match(/boundary=([^\s;]+)/i);

        if (!boundaryMatch) {
            // No boundary found - try to extract HTML directly
            return this.extractHTMLDirect(mhtmlContent);
        }

        const boundary = boundaryMatch[1];
        const parts = mhtmlContent.split('--' + boundary);

        let htmlContent = '';
        const resources = {};

        for (const part of parts) {
            if (part.trim() === '' || part.trim() === '--') continue;

            const headerEndIndex = part.indexOf('\r\n\r\n');
            const headerEndIndex2 = part.indexOf('\n\n');
            const splitIndex = headerEndIndex !== -1 ? headerEndIndex : headerEndIndex2;

            if (splitIndex === -1) continue;

            const headers = part.substring(0, splitIndex);
            const body = part.substring(splitIndex + (headerEndIndex !== -1 ? 4 : 2));

            const contentType = this.getHeader(headers, 'Content-Type');
            const contentTransferEncoding = this.getHeader(headers, 'Content-Transfer-Encoding');
            const contentLocation = this.getHeader(headers, 'Content-Location');

            let decodedBody = body;

            // Decode content based on transfer encoding
            if (contentTransferEncoding) {
                const encoding = contentTransferEncoding.toLowerCase().trim();
                if (encoding === 'base64') {
                    decodedBody = this.decodeBase64(body);
                } else if (encoding === 'quoted-printable') {
                    decodedBody = this.decodeQuotedPrintable(body);
                }
            }

            if (contentType && contentType.includes('text/html')) {
                htmlContent = decodedBody;
            } else if (contentLocation) {
                // Store resource for inline embedding
                const mimeType = contentType ? contentType.split(';')[0].trim() : 'application/octet-stream';
                if (contentTransferEncoding && contentTransferEncoding.toLowerCase().trim() === 'base64') {
                    resources[contentLocation] = `data:${mimeType};base64,${body.replace(/\s/g, '')}`;
                } else {
                    resources[contentLocation] = `data:${mimeType};base64,${btoa(decodedBody)}`;
                }
            }
        }

        if (!htmlContent) {
            return this.extractHTMLDirect(mhtmlContent);
        }

        // Replace resource references with inline data URIs
        for (const [url, dataUri] of Object.entries(resources)) {
            const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedUrl, 'g');
            htmlContent = htmlContent.replace(regex, dataUri);
        }

        return htmlContent;
    }

    extractHTMLDirect(content) {
        // Try to find HTML content directly
        const htmlMatch = content.match(/<html[\s\S]*<\/html>/i);
        if (htmlMatch) {
            return htmlMatch[0];
        }

        // Try to find body content
        const bodyMatch = content.match(/<body[\s\S]*<\/body>/i);
        if (bodyMatch) {
            return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>${bodyMatch[0]}</html>`;
        }

        // Return as pre-formatted text
        return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Converted Document</title></head><body><pre>${this.escapeHTML(content)}</pre></body></html>`;
    }

    getHeader(headers, name) {
        const regex = new RegExp(`^${name}:\\s*(.+)$`, 'im');
        const match = headers.match(regex);
        return match ? match[1].trim() : null;
    }

    decodeBase64(str) {
        try {
            const cleaned = str.replace(/\s/g, '');
            return atob(cleaned);
        } catch (e) {
            return str;
        }
    }

    decodeQuotedPrintable(str) {
        return str
            .replace(/=\r?\n/g, '') // Remove soft line breaks
            .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => {
                return String.fromCharCode(parseInt(hex, 16));
            });
    }

    escapeHTML(str) {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;');
    }

    showResults() {
        this.progressSection.style.display = 'none';
        this.resultsSection.style.display = 'block';

        this.resultsList.innerHTML = this.convertedFiles.map((file, index) => `
            <div class="result-item">
                <div class="result-item-info">
                    <span class="result-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </span>
                    <span class="result-name" title="${file.name}">${file.name}</span>
                </div>
                <div class="result-actions">
                    <button class="btn btn-secondary btn-small" onclick="converter.previewFile(${index})">Preview</button>
                    <button class="btn btn-primary btn-small" onclick="converter.downloadFile(${index})">Download</button>
                </div>
            </div>
        `).join('');
    }

    previewFile(index) {
        const file = this.convertedFiles[index];
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(file.content);
        previewWindow.document.close();
    }

    downloadFile(index) {
        const file = this.convertedFiles[index];
        const blob = new Blob([file.content], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async downloadAllAsZip() {
        if (this.convertedFiles.length === 0) return;

        const zip = new JSZip();

        this.convertedFiles.forEach(file => {
            zip.file(file.name, file.content);
        });

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted-html-files.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    startOver() {
        this.files = [];
        this.convertedFiles = [];
        this.uploadSection.style.display = 'block';
        this.fileListSection.style.display = 'none';
        this.progressSection.style.display = 'none';
        this.resultsSection.style.display = 'none';
        this.progressFill.style.width = '0%';
        this.uploadSection.querySelector('.drop-zone').style.padding = '3rem 2rem';
        this.uploadSection.querySelector('.drop-zone h3').style.fontSize = '1.3rem';
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}

// Initialize the converter
const converter = new MHTMLConverter();
