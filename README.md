# GHOST S1

A cyberpunk-style ChatGPT clone that runs a **local LLM entirely on your machine**. No API keys. No cloud. No rate limits.

Built by **Abdul Ahad** — Software Engineering student, Dong Eui University, Busan.

**Live demo:** https://youtu.be/placeholder (record a 30-second screen capture and replace this)

---

## What is this?

You have **two layers**:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Model** | `qwen2.5:1.5b` via Ollama | The actual AI brain. Runs entirely on your machine. No API key. No internet needed after setup. |
| **Custom Personality** | Ollama `Modelfile` | A custom "system prompt" that makes it *your* model — "GHOST S1", with a unique personality and identity. |
| **Frontend** | PHP + HTML + CSS + JS | A ChatGPT-like web interface with sidebar, chat history, streaming, and CRT monitor design. |
| **Backend** | `api.php` | PHP API that connects to Ollama, handles chat history via SQLite, and streams responses back in real-time. |

**This is "my own model" because:**
- It has its own custom name, system prompt, and personality
- It runs locally — not via OpenAI or any cloud
- You created it using Ollama's model customization API, not just calling someone else's API

---

## Screenshots

*(Add screenshots here — boot screen, chat interface, settings panel)*

---

## Quick Start

### macOS / Linux (One-line)

```bash
# Clone
git clone https://github.com/AbdullAhad1/ghost-s1.git
cd ghost-s1

# Install dependencies + model
bash setup.sh

# Start the web server
php -S 0.0.0.0:8080

# Open in browser
http://localhost:8080
```

### Windows (One-shot)

```powershell
# Clone
git clone https://github.com/AbdullAhad1/ghost-s1.git
cd ghost-s1

# Right-click setup-windows.ps1 → "Run with PowerShell"
# Or from terminal:
.\setup-windows.ps1

# Start the web server
php -S 0.0.0.0:8080

# Open in browser
http://localhost:8080
```

**If using XAMPP:** Copy the `ghost-s1` folder into `C:\xampp\htdocs\`, then visit `http://localhost/ghost-s1/`

---

## Manual Setup (if scripts don't work)

### Prerequisites

| Tool | macOS | Windows | Linux |
|------|-------|---------|-------|
| **Ollama** | `brew install ollama` or https://ollama.com/download/mac | https://ollama.com/download/windows | `curl -fsSL https://ollama.com/install.sh \| sh` |
| **PHP** | `brew install php` | [XAMPP](https://www.apachefriends.org/) or [standalone](https://windows.php.net/download/) | `apt install php php-sqlite3` |
| **Git** | `brew install git` | [Git for Windows](https://git-scm.com/download/win) | `apt install git` |

### Step 1: Start Ollama

```bash
# Terminal 1 — keep this running
ollama serve
```

### Step 2: Pull the base model

```bash
ollama pull qwen2.5:1.5b
```

### Step 3: Create the custom model

```bash
cd /path/to/ghost-s1
ollama create ghost-s1 -f Modelfile-ghost
```

### Step 4: Initialize the database

```bash
php -r "
\$db = new PDO('sqlite:chats.db');
\$db->exec('CREATE TABLE IF NOT EXISTS chats (id INTEGER PRIMARY KEY, title TEXT, model TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
\$db->exec('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, chat_id INTEGER, role TEXT, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
"
```

### Step 5: Start the web server

```bash
php -S 0.0.0.0:8080
```

Open `http://localhost:8080` in your browser.

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
                                             │ system:"You   │
                                             │  are GHOST... │ (Custom prompt)
                                             │  ↓            │
                                             │  ghost-s1     │ (Your named model)
                                             └───────────────┘
```

---

## Features

- **Streaming responses** — Text appears token-by-token like ChatGPT
- **Persistent chat history** — Saved to SQLite, survives page refresh
- **New chat / Rename / Delete** — Full conversation management
- **Multiple models** — Switch between `ghost-s1` and any other installed Ollama model
- **Live system status** — CPU / MEM usage, model power toggle
- **Ghost emotion face** — Animated CSS ghost face that reacts to chat events
- **Professional AI settings** — Temperature, Top-P, Top-K, frequency / presence penalties
- **Markdown rendering** — Code blocks, lists, bold, italics
- **CRT monitor aesthetic** — Cyberpunk retro design with scanlines

---

## How to explain "my own model" to your professor

1. **Base model**: Qwen2.5-1.5B, an open-source transformer from Alibaba, downloaded via Ollama
2. **Customization**: Using Ollama's `Modelfile`, I added a custom `SYSTEM` prompt that defines its name as "GHOST S1" and gives it my chosen personality
3. **Inference engine**: Ollama (open-source, runs locally)
4. **Interface**: A custom PHP web app built from scratch with no frameworks
5. **No OpenAI involvement**: Zero API keys, zero cloud dependency
6. **Your data stays private**: Everything is local

---

## Project Files

| File | Purpose |
|------|---------|
| `setup.sh` | macOS / Linux installer |
| `setup-windows.ps1` | Windows installer (PowerShell) |
| `api.php` | Backend API (Ollama proxy + SQLite persistence) |
| `index.html` | Single-page frontend |
| `style.css` | Cyberpunk CRT styling |
| `app.js` | Frontend logic (streaming, panels, ghost face) |
| `Modelfile-ghost` | GHOST S1 personality definition |
| `chats.db` | Auto-created SQLite database (ignored by git) |

---

## Customization

**Change your model's personality:**

```bash
# Edit Modelfile-ghost, then recreate
ollama create ghost-s1 -f Modelfile-ghost
```

**Change temperature** (creativity: 0 = robotic, 2 = chaotic) in the Settings panel — no rebuild needed.

**Change base model:**

```bash
# Replace qwen2.5:1.5b with any Ollama model
ollama pull llama3.2:1b
# Then edit Modelfile-ghost: FROM llama3.2:1b
ollama create ghost-s1 -f Modelfile-ghost
```

---

## Why Qwen2.5-1.5B?

- Best small model for its size (under 2B parameters)
- Runs at usable speed on CPU (no GPU required)
- Excellent coding and reasoning for a 1.5B parameter model
- Apache 2.0 license — fully open source

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Ollama is not running" | Run `ollama serve` in a separate terminal |
| "Chat not found" | Refresh page |
| Model not in dropdown | Make sure `ghost-s1` shows in `ollama list` |
| Slow responses | Normal for 1.5B on CPU. M1/M2 Macs run on GPU and are much faster. |
| PHP not found (macOS) | `brew install php` |
| PHP not found (Windows) | Install [XAMPP](https://www.apachefriends.org/) |
| PowerShell execution policy blocked | Run in terminal: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| Setup script can't find Ollama on Windows | Install Ollama from https://ollama.com/download/windows first, then re-run `setup-windows.ps1` |

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
- Emotion-driven UI animations
- Cross-platform deployment

---

## License

MIT — Built by **Abdul Ahad** as a university project.

---

## Links

- **Repository**: https://github.com/AbdullAhad1/ghost-s1
- **Ollama**: https://ollama.com
- **Qwen**: https://github.com/QwenLM/Qwen
