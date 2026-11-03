chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'saveSelected') {
    chrome.storage.local.get(['prompts', 'isPremium'], (result) => {
      const prompts = result.prompts || [];
      const isPremium = result.isPremium || false;
      if (!isPremium && prompts.length >= 10) {
        // Could open popup or show notification
        return;
      }
      const newPrompt = {
        id: Date.now().toString(),
        title: 'Saved from selection ' + new Date().toLocaleDateString(),
        content: msg.content,
        tags: 'selected',
        createdAt: new Date().toISOString()
      };
      prompts.push(newPrompt);
      chrome.storage.local.set({ prompts });
    });
  }
});
