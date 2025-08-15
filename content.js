let btn = document.createElement('button');
btn.textContent = 'Ask AI';
btn.style.position = 'absolute';
btn.style.zIndex = '9999';
btn.style.display = 'none';
document.body.appendChild(btn);

let popup = document.createElement('div');
popup.style.position = 'absolute';
popup.style.zIndex = '10000';
popup.style.background = 'white';
popup.style.border = '2px solid black'; // Updated line for the black border
popup.style.padding = '8px';
popup.style.maxWidth = '300px';
popup.style.display = 'none';
document.body.appendChild(popup);

let lastMouseX = 0, lastMouseY = 0;
let currentUtterance = null;

document.addEventListener('mousemove', (e) => {
  lastMouseX = e.pageX;
  lastMouseY = e.pageY;
});

document.addEventListener('mouseup', () => {
  const selection = window.getSelection().toString().trim();
  if (selection) {
    btn.style.top = `${lastMouseY + 6}px`;
    btn.style.left = `${lastMouseX}px`;
    showBtn(selection);
  } else {
    btn.style.display = 'none';
  }
});

function showBtn(text) {
  btn.style.display = 'block';
  btn.dataset.qwzText = text;
}

btn.addEventListener('click', () => {
  const text = btn.dataset.qwzText || '';
  if (!text) return;

  // This is the updated line to display the spinner
  popup.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <div id="qwz-spinner"></div>
      <span>Thinking...</span>
    </div>
  `;
  popup.style.top = `${parseInt(btn.style.top) + 30}px`;
  popup.style.left = btn.style.left;
  popup.style.display = 'block';

  chrome.runtime.sendMessage(
    { type: 'ask-ai', prompt: text },
    (response) => {
      const aiText = response?.text || 'No response';

      // Clear previous content
      popup.innerHTML = '';

      // Add AI text
      let textDiv = document.createElement('div');
      textDiv.textContent = aiText;
      popup.appendChild(textDiv);

      // Add speaker button
      let speakerBtn = document.createElement('button');
      speakerBtn.textContent = '🔊';
      speakerBtn.style.marginTop = '6px';
      speakerBtn.style.cursor = 'pointer';
      speakerBtn.style.border = 'none';
      speakerBtn.style.background = 'transparent';
      speakerBtn.style.fontSize = '16px';
      speakerBtn.title = 'Read aloud';
      popup.appendChild(speakerBtn);

      // Speech synthesis on click
      speakerBtn.addEventListener('click', () => {
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel();
          speakerBtn.textContent = '🔊';
          currentUtterance = null;
        } else {
          const utterance = new SpeechSynthesisUtterance(aiText);
          speechSynthesis.speak(utterance);
          currentUtterance = utterance;
          speakerBtn.textContent = '⏹️';
          
          utterance.onend = () => {
            speakerBtn.textContent = '🔊';
            currentUtterance = null;
          };
        }
      });
    }
  );
});

// Hide popup when clicking outside
document.addEventListener('click', (e) => {
  if (!popup.contains(e.target) && e.target !== btn) {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      currentUtterance = null;
    }
    popup.style.display = 'none';
  }
});