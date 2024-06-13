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

    let lastSettings = {};
    let lastContent = '';

    // Четене на HTML файл и визуализация на съдържанието
    document.getElementById('fileForm').addEventListener('submit', function(event) {
        event.preventDefault();
        console.log("Form submitted");

        resetSettings();

        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        if (file && file.type === 'text/html') {
            console.log("HTML file selected");
            const reader = new FileReader();
            reader.onload = function(e) {
                const contentDiv = document.getElementById('content');
                const parser = new DOMParser();
                const doc = parser.parseFromString(e.target.result, 'text/html');
                const bodyContent = doc.body.innerHTML;  // Извличаме само съдържанието на тялото на документа
                contentDiv.innerHTML = bodyContent;
                contentDiv.style.display = 'block';
                contentDiv.classList.add('box');
                updatePageSize('A4');
                updatePageOrientation('Portrait');
                lastContent = contentDiv.innerHTML;
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

    document.getElementById('maxChars').addEventListener('input', applySettings);
    document.getElementById('maxWords').addEventListener('input', applySettings);

    function resetSettings() {
        document.getElementById('maxChars').value = '';
        document.getElementById('maxWords').value = '';
        document.getElementById('showPageNumbers').checked = false;
        document.getElementById('removePageNumbers').checked = false;
        document.getElementById('showLineNumbers').checked = false;
        document.getElementById('removeLineNumbers').checked = false;
        document.getElementById('pageSize').value = 'A4';
        document.getElementById('pageOrientation').value = 'Portrait';

        lastSettings = {};
        lastContent = '';
    }

    function applySettings() {
        const contentDiv = document.getElementById('content');

        const maxChars = parseInt(document.getElementById('maxChars').value) || null;
        const maxWords = parseInt(document.getElementById('maxWords').value) || null;
        const showPageNumbers = document.getElementById('showPageNumbers').checked;
        const removePageNumbers = document.getElementById('removePageNumbers').checked;
        const showLineNumbers = document.getElementById('showLineNumbers').checked;
        const removeLineNumbers = document.getElementById('removeLineNumbers').checked;
        const pageSize = document.getElementById('pageSize').value || 'A4';
        const pageOrientation = document.getElementById('pageOrientation').value || 'Portrait';

        const currentSettings = {
            maxChars, maxWords, showPageNumbers, removePageNumbers, showLineNumbers, removeLineNumbers, pageSize, pageOrientation
        };

        lastSettings = currentSettings;

        console.log("Settings:", currentSettings);

        let modifiedContent = lastContent;

        let paginatedContent = paginateContent(modifiedContent, maxChars, maxWords, showPageNumbers, removePageNumbers, showLineNumbers, removeLineNumbers);

        updatePageSize(pageSize);
        updatePageOrientation(pageOrientation);

        const newContentDiv = document.createElement('div');
        newContentDiv.classList.add('box');
        newContentDiv.innerHTML = paginatedContent;

        contentDiv.parentNode.replaceChild(newContentDiv, contentDiv);
        newContentDiv.id = 'content';
        lastContent = newContentDiv.innerHTML;
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

    function paginateContent(text, maxChars, maxWords, showPageNumbers, removePageNumbers, showLineNumbers, removeLineNumbers) {
        let words = text.split(/\s+/);
        let currentPage = '';
        let paginatedContent = '';
        let charCount = 0;
        let wordCount = 0;
        let pageNumber = 1;
        let lineNum = 1;
        let pages = [];

        words.forEach((word, index) => {
            if ((maxChars !== null && charCount + word.length > maxChars) || 
                (maxWords !== null && wordCount + 1 > maxWords)) {
                if (showPageNumbers && !removePageNumbers) {
                    currentPage += `<div class="page-number">Page ${pageNumber}</div>`;
                }
                pages.push(currentPage.trim());
                currentPage = '';
                charCount = 0;
                wordCount = 0;
                pageNumber++;
            }

            if (showLineNumbers && !removeLineNumbers) {
                currentPage += `${lineNum}: ${word} `;
                lineNum++;
            } else {
                currentPage += `${word} `;
            }

            charCount += word.length + 1; // +1 за интервала
            wordCount++;
        });

        if (currentPage.trim() !== '') {
            if (showPageNumbers && !removePageNumbers) {
                currentPage += `<div class="page-number">Page ${pageNumber}</div>`;
            }
            pages.push(currentPage.trim());
        }

        paginatedContent = pages.join('<!--PAGE_BREAK-->');

        if (removePageNumbers) {
            paginatedContent = paginatedContent.replace(/<div class="page-number">Page \d+<\/div>/g, '');
        }

        if (removeLineNumbers) {
            paginatedContent = paginatedContent.replace(/\d+: /g, '');
        }

        return paginatedContent;
    }

    function downloadDocx() {
        const contentDiv = document.getElementById('content');
        const textContent = contentDiv.innerHTML;

        const { Document, Packer, Paragraph, TextRun, PageBreak } = window.docx;

        const sections = textContent.split('<!--PAGE_BREAK-->').map(pageContent => {
            return {
                properties: {},
                children: pageContent.split('<br>').map(line => new Paragraph({
                    children: [
                        new TextRun({
                            text: line.replace(/<\/?[^>]+(>|$)/g, ""), // Премахване на останалите HTML тагове
                            break: 1
                        })
                    ]
                }))
            };
        });

        const doc = new Document({
            sections: sections
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
