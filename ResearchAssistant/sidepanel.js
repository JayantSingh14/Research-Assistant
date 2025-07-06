// document.addEventListener('DOMContentLoaded', () => {
//     chrome.storage.local.get(['researchNotes'], function(result){
//         if(result.researchNotes){
//             document.getElementById('notes').value = result.researchNotes;
//         }
//     });

//     document.getElementById('summarizeBtn').addEventListener('click', summarizeText);
//     document.getElementById('saveNotesBtn').addEventListener('click', saveNotes);
//     const themeToggle = document.getElementById('themeToggle');

//     // Helper function to apply theme
//     function applyTheme(theme) {
//         if (theme === 'light' || theme === 'dark') {
//             document.documentElement.setAttribute('data-theme', theme);
//         } else {
//             document.documentElement.removeAttribute('data-theme');
//         }
//     }

//     // Helper function to set icon
//     function updateIcon(theme) {
//         if (theme === 'dark') {
//             themeToggle.textContent = '🌙';
//         } else if (theme === 'light') {
//             themeToggle.textContent = '🌞';
//         } else {
//             themeToggle.textContent = '🌓';
//         }
//     }

//     // Load saved theme from localStorage
//     let savedTheme = localStorage.getItem('theme') || 'auto';
//     applyTheme(savedTheme);
//     updateIcon(savedTheme);

//     // On button click: animate, cycle theme, save
//     themeToggle.addEventListener('click', () => {
//         // Add rotate animation
//         themeToggle.classList.add('rotate');
//         setTimeout(() => themeToggle.classList.remove('rotate'), 600);

//         // Cycle theme
//         if (savedTheme === 'auto') {
//             savedTheme = 'light';
//         } else if (savedTheme === 'light') {
//             savedTheme = 'dark';
//         } else {
//             savedTheme = 'auto';
//         }

//         // Save + apply
//         localStorage.setItem('theme', savedTheme);
//         applyTheme(savedTheme);
//         updateIcon(savedTheme);
//     });
// });

// async function summarizeText() {
//     try{
//         const [tab]= await chrome.tabs.query({ active:true, currentWindow: true});

//         //  if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
//         //     showResult('Error: Cannot access this page. Please switch to a regular website.');
//         //     return;
//         //  }   
        
//         if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
//             showResult('Error: Cannot access this page. Please switch to a normal website.');
//             return;
//         }
//         const [{results}]= await chrome.scripting.executeScript({
//             target: {tabId: tab.id},
//             function: () => window.getSelection().toString()


//         });

//         // if(!result){
//         //     showResult('please select some text first');
//         //     return;

//         // } 
//         if (!results || results.length === 0 || typeof results[0].result == 'undefined') {
//             showResult('Please select some text first.');
//             return;
//         }
        
//         const selectedText = results[0].result;
         
//         const response= await fetch('http://localhost:8080/api/research/process', {

//             method:'POST',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify({ content: selectedText, operation: 'summarize'})
//         });

//         if(!response.ok){
//             throw new Error(`API Error: ${response.status}`);
//         }

//         const text= await response.text();
//         showResult(text.replace(/\n/g,'<br>'));


//     }catch(error){
//         showResult('Error: '+ error.message);

//     }

    
// }

// async function saveNotes() {
//     const notes = document.getElementById('notes').value;
//     chrome.storage.local.set({'researchNotes': notes}, function(){
//         alert('Notes saved successfully')

//     });
    
// }
// function showResult(content){
//     document.getElementById('results').innerHTML=`<div class="result-item"><div class="result-content">${content}</div></div>`;
    

// }

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['researchNotes'], function (result) {
        if (result.researchNotes) {
            document.getElementById('notes').value = result.researchNotes;
        }
    });

    document.getElementById('summarizeBtn').addEventListener('click', summarizeText);
    document.getElementById('saveNotesBtn').addEventListener('click', saveNotes);

    const themeToggle = document.getElementById('themeToggle');

    function applyTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            document.documentElement.setAttribute('data-theme', theme);
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    function updateIcon(theme) {
        if (theme === 'dark') {
            themeToggle.textContent = '🌙';
        } else if (theme === 'light') {
            themeToggle.textContent = '🌞';
        } else {
            themeToggle.textContent = '🌓';
        }
    }

    let savedTheme = localStorage.getItem('theme') || 'auto';
    applyTheme(savedTheme);
    updateIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        themeToggle.classList.add('rotate');
        setTimeout(() => themeToggle.classList.remove('rotate'), 600);

        if (savedTheme === 'auto') {
            savedTheme = 'light';
        } else if (savedTheme === 'light') {
            savedTheme = 'dark';
        } else {
            savedTheme = 'auto';
        }

        localStorage.setItem('theme', savedTheme);
        applyTheme(savedTheme);
        updateIcon(savedTheme);
    });
});

async function summarizeText() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        console.log("Active tab URL:", tab.url);

        if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
            showResult('Error: Cannot access this page. Please switch to a normal website.');
            return;
        }

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                console.log("Running script to get selection...");
                return window.getSelection().toString();
            }
        });

        console.log("Script results:", results);

        if (!results || results.length === 0 || !results[0].result.trim()) {
            showResult('Please select some text first.');
            return;
        }

        const selectedText = results[0].result;
        console.log("Selected text:", selectedText);

        const response = await fetch('http://localhost:8080/api/research/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: selectedText, operation: 'summarize' })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const text = await response.text();
        showResult(text.replace(/\n/g, '<br>'));

    } catch (error) {
        console.error("Summarize error:", error);
        showResult('Error: ' + error.message);
    }
}

async function saveNotes() {
    const notes = document.getElementById('notes').value;
    chrome.storage.local.set({ 'researchNotes': notes }, function () {
        alert('Notes saved successfully');
    });
}

function showResult(content) {
    document.getElementById('results').innerHTML =
        `<div class="result-item"><div class="result-content">${content}</div></div>`;
}

