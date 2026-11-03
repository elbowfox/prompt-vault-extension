// Content script to add "Save Prompt" button on AI chat sites
function addSaveButton() {
  if (document.getElementById('promptvault-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'promptvault-btn';
  btn.textContent = '💾 Save to Vault';
  btn.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; z-index: 99999;
    background: #6366f1; color: white; border: none; padding: 10px 16px;
    border-radius: 20px; cursor: pointer; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  btn.onclick = () => {
    // Try to grab the last user message or selected text
    const selection = window.getSelection().toString();
    if (selection) {
      chrome.runtime.sendMessage({ action: 'saveSelected', content: selection });
      btn.textContent = 'Saved!';
      setTimeout(() => btn.textContent = '💾 Save to Vault', 1500);
      return;
    }
    alert('Select text first, or use the popup to save manually.');
  };
  document.body.appendChild(btn);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addSaveButton);
} else {
  addSaveButton();
}

// Observe for dynamic content
const observer = new MutationObserver(addSaveButton);
observer.observe(document.body, { childList: true, subtree: true });
