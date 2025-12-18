const promptEl = document.getElementById('prompt');
const sizeEl = document.getElementById('size');
const countEl = document.getElementById('count');
const statusEl = document.getElementById('status');
const generateBtn = document.getElementById('generateBtn');
const galleryEl = document.getElementById('gallery');
const setupKeyBtn = document.getElementById('setupKeyBtn');

const API_KEY_KEY = 'mini_img_api_key';

function getApiKey() {
    return localStorage.getItem(API_KEY_KEY) || '';
}
 function setApiKey(k) {
    localStorage.setItem(API_KEY_KEY, (k || '').trim());
}
setupKeyBtn.addEventListener('click', () => {
    const current = getApiKey();
    const k = prompt('Enter OpenAI API key (sk-...):', current);
    if (k != null) {
        setApiKey(k);
    }
});
async function callImageApi(promptText, size, n) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('No API key. Click "API Key" button first.');
    }
    const body = {
        model: 'gpt-image-1',
        prompt: promptText,
        size: size,
        n: n
    };
    const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer' + apiKey,
            'Content-Type': 'applications/json'
        },
        body: JSON.stringify(body)
    })
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
    }
    const data = await res.json();
    return data.data.map(d => d.url);
}
function setStatus(text) {
    statusEl.textContent = text || '';
}
function setLoading(on) {
    generateBtn.disabled = on;
    generateBtn.textContent = on ? 'Generating... ' : 'Generate';
}
function addImageCard(url, promptText) {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = url;
    img.alt = promptText;

    const footer = document.createElement('div');
    footer.className = 'card-footer';
    footer.innerHTML = `<span title="${promptText}">${promptText.slice(0, 20)}${promptText.length > 20 ? '...' : ''}</span>`;

    const btnOpen = document.createElement('button');
    btnOpen.textContent = 'Open';
    btnOpen.addEventListener('click', () => {
        window.open(url, '_blank');
    });

    footer.appendChild(btnOpen);
    card.appendChild(img);
    card.appendChild(footer);
    galleryEl.prepend(card);
}

generateBtn.addEventListener('click', async () => {
    const promptText = promptEl.ariaValueMax.trim();
    const size = sizeEl.value;
    const n = Math.max(1, Math.min(4, parseInt(countEl.value, 10) || 1));
    if (!promptText){
        alert('Please enter a prompt.');
        return;
    }
    setStatus('');
    setLoading(true);
    try {
        const urls = await callImageApi(promptText, size, n);
        if (!urls.length) {
            setStatus('No images returned.');
            return;
        }
        urls.forEach(url => addImageCard(url, promptText));
        setStatus(`Got ${urls.length} image(s),`);
    }
    catch (err) {
        console.error(err);
        setStatus('Error: ' + (err.message || 'request failed'));
    }
    finally {
        setLoading(false);
    }
})
