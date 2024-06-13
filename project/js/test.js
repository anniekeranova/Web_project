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

    function applySettings() {
        const contentDiv = document.getElementById('content');

        const maxChars = parseInt(document.getElementById('maxChars').value) || null;
        const maxWords = parseInt(document.getElementById('maxWords').value) || null;
        const showPageNumbers = document.getElementById('showPageNumbers').checked;
        const removePageNumbers = document.getElementById('removePageNumbers').checked;
        const showLineNumbers = document.getElementById('showLineNumbers').checked;
        const removeLineNumbers = document.getElementById('removeLineNumbers').checked;
        const pageSize = document.getElementById('pageSize').value;
        const pageOrientation = document.getElementById('pageOrientation').value;

        const currentSettings = {
            maxChars, maxWords, showPageNumbers, removePageNumbers, showLineNumbers, removeLineNumbers, pageSize, pageOrientation
        };

        if (JSON.stringify(currentSettings) === JSON.stringify(lastSettings) && contentDiv.innerHTML === lastContent) {
            console.log("No new changes in settings or content");
            return;
        }

        lastSettings = currentSettings;
        lastContent = contentDiv.innerHTML;

        console.log("Settings:", currentSettings);

        let modifiedContent = lastContent;

        if (maxChars) {
            modifiedContent = modifiedContent.slice(0, maxChars);
        }

        if (maxWords) {
            const words = modifiedContent.split(/\s+/);
            modifiedContent = words.slice(0, maxWords).join(' ');
        }

        let paginatedContent = paginateContent(modifiedContent, showPageNumbers, removePageNumbers, showLineNumbers, removeLineNumbers, maxWords);

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

    function paginateContent(text, showPageNumbers, removePageNumbers, showLineNumbers, removeLineNumbers, maxWords) {
        const maxCharsPerPage = 2000;
        let pages = [];
        let currentPage = '';
        let charCount = 0;
        let wordCount = 0;
        let lineNum = 1;

        text.split('\n').forEach(line => {
            if (line.trim() !== "") { // Проверка дали редът не е празен
                const wordsInLine = line.split(/\s+/).length;

                if (showLineNumbers && !removeLineNumbers) {
                    currentPage += `${lineNum}: ${line}<br>`;
                    lineNum++;
                } else {
                    currentPage += `${line}<br>`;
                }

                charCount += line.length;
                wordCount += wordsInLine;
            }
        });

        if (currentPage) {
            pages.push(currentPage);
        }

        let paginatedContent = pages.join('<div class="page-break"></div>');

        if (showPageNumbers && !removePageNumbers && !maxWords) {
            paginatedContent += `<div class="page-number">Page 1</div>`;
        }

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
        const textContent = contentDiv.innerText;

        const { Document, Packer, Paragraph } = window.docx;

        const doc = new Document({
            sections: [{
                properties: {},
                children: textContent.split('\n').map((line, index) => {
                    if (line.trim() !== "") { // Проверка дали редът не е празен
                        return new Paragraph({
                            text: lastSettings.showLineNumbers && !lastSettings.removeLineNumbers ? `${index + 1}: ${line}` : line
                        });
                    }
                }).filter(paragraph => paragraph !== undefined)
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
