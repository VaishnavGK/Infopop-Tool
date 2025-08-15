chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "ask-ai") {
    const apiKey = "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"; // Replace with your OpenRouter API key

    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://quizwiz-extension",
        "X-Title": "QuizWiz Extension"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: msg.prompt }
        ],
        max_tokens: 200
      })
    })
      .then(res => res.json())
      .then(data => {
        sendResponse({
          text: data.choices?.[0]?.message?.content || "No AI response"
        });
      })
      .catch(err => {
        console.error(err);
        sendResponse({ text: "Error: " + err.message });
      });

    return true; // Keep sendResponse alive for async
  }
});
