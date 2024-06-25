document.addEventListener('DOMContentLoaded', function() {
    console.log("JS loaded and running");

    if (typeof window.docx === 'undefined') {
        console.error('docx library is not loaded');
        alert('docx library is not loaded');
        return;
    } else {
        console.log('docx library is loaded');
    }

    // Скриване на съдържанието до качване на файл
    document.getElementById('content').style.display = 'none';

    // Четене на HTML файл и визуализация на съдържанието
    document.getElementById('fileForm').addEventListener('submit', function(event) {
        event.preventDefault();
        console.log("Form submitted");

        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        if (file && file.type === 'text/html') {
            console.log("HTML file selected");
            const reader = new FileReader();
            reader.onload = function(e) {
                const contentDiv = document.getElementById('content');
                const plainText = e.target.result;
                contentDiv.innerHTML = plainText;
                contentDiv.style.display = 'block';
                contentDiv.classList.add('box');
                console.log("File content loaded");
            };
            reader.readAsText(file);
        } else {
            alert('Моля, прикачете HTML файл.');
        }
    });

    document.getElementById('applySettings').addEventListener('click', function() {
        console.log("Apply settings clicked");
        applySettings();
    });

    document.getElementById('downloadDocx').addEventListener('click', function() {
        console.log("Download as .docx clicked");
        if (typeof window.docx === 'undefined') {
            console.error('docx library is not loaded');
            alert('docx library is not loaded');
            return;
        }
        downloadDocx();
    });

    function applySettings() {
        const contentDiv = document.getElementById('content');
        const originalHTML = contentDiv.innerHTML;

        const maxChars = parseInt(document.getElementById('maxChars').value) || null;
        const maxWords = parseInt(document.getElementById('maxWords').value) || null;
        const showPageNumbers = document.getElementById('showPageNumbers').checked;
        const showLineNumbers = document.getElementById('showLineNumbers').checked;
        const pageSize = document.getElementById('pageSize').value;
        const pageOrientation = document.getElementById('pageOrientation').value;

        console.log("Settings:", { maxChars, maxWords, showPageNumbers, showLineNumbers, pageSize, pageOrientation });

        let modifiedContent = originalHTML;

        if (maxChars) {
            modifiedContent = modifiedContent.slice(0, maxChars);
        }

        if (maxWords) {
            const words = modifiedContent.split(/\s+/);
            modifiedContent = words.slice(0, maxWords).join(' ');
        }

        let paginatedContent = paginateContent(modifiedContent, showPageNumbers, showLineNumbers, maxWords);

        updatePageSize(pageSize);
        updatePageOrientation(pageOrientation);

        const newContentDiv = document.createElement('div');
        newContentDiv.classList.add('box');
        newContentDiv.innerHTML = paginatedContent;

        contentDiv.parentNode.replaceChild(newContentDiv, contentDiv);
        newContentDiv.id = 'content';
    }

    function updatePageSize(pageSize) {
        const contentDiv = document.getElementById('content');
        switch (pageSize) {
            case 'Letter':
                contentDiv.style.width = '8.5in';
                contentDiv.style.height = '11in';
                break;
            case 'Legal':
                contentDiv.style.width = '8.5in';
                contentDiv.style.height = '14in';
                break;
            case 'A4':
                contentDiv.style.width = '210mm';
                contentDiv.style.height = '297mm';
                break;
            case 'A3':
                contentDiv.style.width = '297mm';
                contentDiv.style.height = '420mm';
                break;
            case 'A2':
                contentDiv.style.width = '420mm';
                contentDiv.style.height = '594mm';
                break;
            default:
                contentDiv.style.width = '100%';
                contentDiv.style.height = 'auto';
                break;
        }
    }

    function updatePageOrientation(pageOrientation) {
        const contentDiv = document.getElementById('content');
        if (pageOrientation === 'Landscape') {
            contentDiv.style.transform = 'rotate(90deg)';
            contentDiv.style.transformOrigin = 'left top';
        } else {
            contentDiv.style.transform = 'none';
        }
    }

    function paginateContent(text, showPageNumbers, showLineNumbers, maxWords) {
        const maxCharsPerPage = 2000;
        let pages = [];
        let currentPage = '';
        let charCount = 0;
        let wordCount = 0;
        let pageNum = 1;
        let lineNum = 1;

        text.split('\n').forEach(line => {
            const wordsInLine = line.split(/\s+/).length;
            if ((charCount + line.length > maxCharsPerPage) || (maxWords && (wordCount + wordsInLine > maxWords))) {
                if (showPageNumbers) {
                    currentPage += `<div class="page-number">Page ${pageNum}</div>`;
                }
                pages.push(currentPage);
                currentPage = '';
                charCount = 0;
                wordCount = 0;
                pageNum++;
            }

            if (showLineNumbers) {
                currentPage += `${lineNum}: ${line}<br>`;
                lineNum++;
            } else {
                currentPage += `${line}<br>`;
            }

            charCount += line.length;
            wordCount += wordsInLine;
        });

        if (currentPage) {
            if (showPageNumbers) {
                currentPage += `<div class="page-number">Page ${pageNum}</div>`;
            }
            pages.push(currentPage);
        }

        return pages.join('<div class="page-break"></div>');
    }

    function downloadDocx() {
        const contentDiv = document.getElementById('content');
        const textContent = contentDiv.innerText;

        const { Document, Packer, Paragraph } = window.docx;

        const doc = new Document({
            sections: [{
                properties: {},
                children: textContent.split('\n').map(line => new Paragraph(line))
            }]
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, 'output.docx');
            console.log("Document generated and downloaded");
        }).catch(error => {
            console.error('Error creating document:', error);
            alert('Error creating document');
        });
    }
});
