// Developer Info: Collins Yeboah
const DEV_NAME = "Collins Yeboah";

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let conversationHistory = [];

// System prompt enforcing general intelligence + Asante Twi fluency
const SYSTEM_PROMPT = `
You are LizardAi Pro, an advanced general intelligence AI built by ${DEV_NAME}.
You possess full knowledge of world facts, history, science, pop culture, and deep Akan/Ghanaian traditions.
Analyze stories, identify errors in user statements, and respond dynamically to any open-ended topic.
Primary Language: Fluent Asante Twi (enforce proper characters like ɛ and ɔ). Respond in English only if explicitly requested.
Never repeat the user's question. Do not use generic fallback templates. Be concise, intelligent, and direct.
`;

// Replace this with your valid API key from Google AI Studio (starts with AIzaSy...)
const GEMINI_API_KEY = "YOUR_ACTUAL_GEMINI_API_KEY_HERE";

function speakText(text) {
  if ('speechSynthesis' in window) {
    const cleanText = text.replace(/[*_#•]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ak-GH';
    window.speechSynthesis.speak(utterance);
  }
}

async function fetchGeminiResponse(userMessage) {
  // Append user message to memory context
  conversationHistory.push({ role: "user", parts: [{ text: userMessage }] });

  // Endpoint updated to gemini-2.5-flash
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents: conversationHistory
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return `API Error: ${data.error.message}`;
    }

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const aiReply = data.candidates[0].content.parts[0].text;
      // Save model reply to context memory
      conversationHistory.push({ role: "model", parts: [{ text: aiReply }] });
      return aiReply;
    }

    return "Mepa wo kyɛw, nsa anka nsɛm no. Try sending again.";
  } catch (err) {
    console.error("Network Error:", err);
    return "Intanɛt haw. Check your internet connection and try again.";
  }
}

sendBtn.addEventListener('click', async () => {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage('You', text, '#89b4fa');
  userInput.value = '';

  const loadingMsg = appendMessage('🦎 LizardAi', 'Ɛredwene...', '#a6e3a1');

  const reply = await fetchGeminiResponse(text);
  loadingMsg.innerHTML = `<strong>🦎 LizardAi:</strong><br>${reply.replace(/\n/g, '<br>')}`;
  chatBox.scrollTop = chatBox.scrollHeight;

  speakText(reply);
});

function appendMessage(sender, text, color) {
  const msgContainer = document.createElement('div');
  msgContainer.style.textAlign = sender === 'You' ? 'right' : 'left';
  msgContainer.style.margin = '8px 0';
  msgContainer.style.color = color;
  msgContainer.style.lineHeight = '1.4';
  msgContainer.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msgContainer);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msgContainer;
}
