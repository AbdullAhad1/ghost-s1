# Ahad-GPT
A custom ChatGPT-like interface with its own local LLM — built entirely with **PHP + Vanilla JS + Ollama**. This is a university project demonstrating how anyone can run their own private AI assistant without relying on OpenAI.

---

## What is this?

You have **two layers** here:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Model** | `qwen2.5:1.5b` via Ollama | The actual AI brain. Runs entirely on your machine. No API key. No internet needed after setup. |
| **Custom Personality** | Ollama `Modelfile` | A custom "system prompt" that makes it *your* model — "Ahad-GPT", with your own personality and description. |
| **Frontend** | PHP + HTML + CSS + JS | A ChatGPT-like web interface with sidebar, chat history, markdown rendering, streaming, and dark/light mode. |
| **Backend** | `api.php` | A tiny PHP API that connects to Ollama, handles chat history via SQLite, and streams responses back in real-time. |

**This is "my own model" because:**
- It has its own custom name, system prompt, and personality
- It runs locally — not via OpenAI or any cloud
- You created it using Ollama's model customization API, not just calling someone else's API

---

## Architecture

```
User Browser
    |
    v
index.html  +  style.css  +  app.js   (Frontend)
    |
    v
api.php (PHP + SQLite)  ---- HTTP POST/JSON --->  Ollama localhost:11434
                                                     |
                                             ┌───────────────┐
                                             │ qwen2.5:1.5b  │ (Base weights)
                                             │  ↓            │
                                             │ system:"You are│
                                             │ Ahad-GPT..."  │ (Custom prompt)
                                             │  ↓            │
                                             │  ahad-gpt     │ (Your named model)
                                             └───────────────┘
```

---

## Quick Start (Mac)

### 1. Install Ollama
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Set up the project
```bash
bash setup.sh
```

This downloads the base model, creates your custom `ahad-gpt` model with its personality, and initializes the SQLite database.

### 3. Make sure Ollama is running
```bash
ollama serve
```

(Keep this terminal open in the background. The setup script starts it for you, but you need to restart it if you reboot.)

### 4. Start the PHP server
```bash
cd ~/Desktop/university-chatgpt
php -S 0.0.0.0:8080
```

### 5. Open in browser
http://localhost:8080

---

## Features

- **Streaming responses** — Text appears token-by-token like ChatGPT
- **Persistent chat history** — Saved to SQLite, survives page refresh
- **New chat / Rename / Delete** — Full conversation management
- **Multiple models** — Switch between `ahad-gpt` and base `qwen2.5`
- **Dark / Light mode** — Toggle with one click
- **Markdown rendering** — Code blocks, lists, bold, italics
- **Auto-resizing textarea** — No ugly scrollbars
- **Mobile responsive** — Sidebar hides on small screens

---

## How to explain "my own model" to your professor

1. **Base model**: Qwen2.5-1.5B, an open-source transformer from Alibaba, downloaded via Ollama
2. **Customization**: Using Ollama's `Modelfile`, I added a custom `SYSTEM` prompt that defines its name as "Ahad-GPT" and gives it my chosen personality
3. **Inference engine**: Ollama (open-source, runs locally)
4. **Interface**: A custom PHP web app that I built from scratch
5. **No OpenAI involvement**: Zero API keys, zero cloud dependency
6. **Your data stays private**: Everything is local

---

## Project Files

| File | Purpose |
|------|---------|
| `setup.sh` | One-shot installer |
| `api.php` | Backend API (Ollama proxy + SQLite persistence) |
| `index.html` | Single-page frontend |
| `style.css` | Dark/light theme styling |
| `app.js` | Frontend logic (fetch, streaming, markdown) |
| `chats.db` | Auto-created SQLite database |

---

## Customization

**Change your model's personality:**
```bash
# Edit the model
cat > Modelfile << 'EOF'
FROM qwen2.5:1.5b
SYSTEM """You are an expert coder who speaks only in memes."""
PARAMETER temperature 0.9
EOF
ollama create ahad-gpt -f Modelfile
```

**Change temperature** (creativity level: 0 = robotic, 2 = chaotic) in `Modelfile`, then re-run `ollama create ahad-gpt -f Modelfile`.

---

## Why Qwen2.5-1.5B?

- It's the **best small model** for its size (under 2B params)
- Runs at usable speed on a MacBook Air M1/M2
- Excellent coding and reasoning for a 1.5B parameter model
- Apache 2.0 license — fully open source

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Ollama is not running" | Run `ollama serve` in another terminal |
| "Chat not found" | Refresh page |
| Model not in dropdown | Make sure `ahad-gpt` shows in `ollama list` |
| Slow responses | Normal for 1.5B on CPU. For M1/M2 Mac it runs on GPU, which is fast enough. |
| PHP not found | `brew install php` |

---

## University Notes

**Why this is "your own LLM":**
- You did not just call the `openai.ChatCompletion` API
- You customized an open-source model with your own system prompt
- You built a complete infrastructure stack around it (backend, database, frontend)
- You control the model, its parameters, and its behavior entirely

**Concepts demonstrated:**
- Local LLM inference via Ollama
- Model customization with system prompts
- Server-Sent Events / streaming architecture
- REST API design (PHP)
- Frontend reactive state management (vanilla JS)
- SQLite persistence
- Token-based text generation

---

Built by **Ahad** as a university project.
