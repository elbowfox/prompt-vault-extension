const FREE_LIMIT = 10;

async function getPrompts() {
  const result = await chrome.storage.local.get(['prompts', 'isPremium']);
  return {
    prompts: result.prompts || [],
    isPremium: result.isPremium || false
  };
}

async function savePrompts(prompts) {
  await chrome.storage.local.set({ prompts });
}

async function renderPrompts(filter = '') {
  const { prompts, isPremium } = await getPrompts();
  const list = document.getElementById('promptList');
  list.innerHTML = '';
  
  document.getElementById('planBadge').style.display = isPremium ? 'inline' : 'none';

  const filtered = prompts.filter(p => 
    p.title.toLowerCase().includes(filter.toLowerCase()) ||
    p.content.toLowerCase().includes(filter.toLowerCase()) ||
    (p.tags || '').toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    list.innerHTML = '<p style="color:#666;text-align:center;">No prompts yet. Save your first one!</p>';
    return;
  }

  filtered.forEach(prompt => {
    const div = document.createElement('div');
    div.className = 'prompt-item';
    div.innerHTML = `
      <div class="title">${prompt.title}</div>
      <div style="color:#555;font-size:12px;margin:4px 0;">${prompt.content.substring(0, 80)}...</div>
      <div style="font-size:11px;color:#888;">${prompt.tags || ''}</div>
      <button class="copyBtn" data-id="${prompt.id}" style="font-size:11px;padding:4px 8px;">Copy</button>
      <button class="deleteBtn" data-id="${prompt.id}" style="background:#ef4444;font-size:11px;padding:4px 8px;">Delete</button>
    `;
    list.appendChild(div);
  });

  document.querySelectorAll('.copyBtn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const { prompts } = await getPrompts();
      const p = prompts.find(x => x.id === id);
      if (p) {
        await navigator.clipboard.writeText(p.content);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1000);
      }
    };
  });

  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const { prompts } = await getPrompts();
      const updated = prompts.filter(p => p.id !== id);
      await savePrompts(updated);
      renderPrompts(document.getElementById('search').value);
    };
  });
}

document.getElementById('saveBtn').onclick = async () => {
  const title = document.getElementById('newTitle').value.trim();
  const content = document.getElementById('newContent').value.trim();
  const tags = document.getElementById('newTags').value.trim();
  if (!title || !content) return alert('Title and content required');

  const { prompts, isPremium } = await getPrompts();
  if (!isPremium && prompts.length >= FREE_LIMIT) {
    alert(`Free plan limited to ${FREE_LIMIT} prompts. Upgrade to Pro for unlimited!`);
    return;
  }

  const newPrompt = {
    id: Date.now().toString(),
    title,
    content,
    tags,
    createdAt: new Date().toISOString()
  };
  prompts.push(newPrompt);
  await savePrompts(prompts);
  document.getElementById('newTitle').value = '';
  document.getElementById('newContent').value = '';
  document.getElementById('newTags').value = '';
  renderPrompts();
};

document.getElementById('search').oninput = (e) => renderPrompts(e.target.value);

document.getElementById('upgradeBtn').onclick = () => {
  chrome.tabs.create({ url: 'https://your-domain.com/upgrade' }); // Replace with your Stripe/LemonSqueezy link
};

// Init
renderPrompts();
