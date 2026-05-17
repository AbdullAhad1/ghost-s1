# How Ahad-GPT Actually Works — Visual Guide

Think of it like a restaurant. You (the customer) talk to a waiter (the frontend), who tells the kitchen (the AI model), and brings back food (the response).

---

##  The Big Picture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         YOUR BROWSER                                │
│  ┌─────────────────┐     ┌──────────────────┐                      │
│  │  You type:      │     │  index.html      │                     │
│  │  "Hello!"       │───▶ │  + style.css     │                     │
│  └─────────────────┘     │  + app.js        │                     │
│                          └────────┬─────────┘                     │
│                                   │                                │
└───────────────────────────────────┼────────────────────────────────┘
                                    │ POST request
                                    ▼
                          ┌─────────────────┐
                          │    api.php      │  ◀── PHP Backend
                          │  (PHP server)   │      Handles:
                          └────────┬────────┘      - Saving history
                                   │               - Calling Ollama
                                   ▼
                          ┌─────────────────┐
                          │   Ollama AI     │  ◀── The "Brain"
                          │   localhost:11434│     Runs your model
                          └────────┬────────┘      "ahad-gpt"
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  chats.db       │  ◀── SQLite Database
                          │  (SQLite file)  │     Saves conversations
                          └─────────────────┘
```

---

##  Step-by-Step: What Happens When You Send a Message

### Step 1: You Type in the Browser
You open: **http://localhost:8080**

You type: `Hello! Who are you?`

This is the **Frontend** — a file called `index.html`. It's like a form you fill out.

---

### Step 2: JavaScript Catches It
A file called `app.js` (inside the browser) says:
> "Okay, user sent a message. I need to send it to the server."

It sends a POST request to:
```
POST http://localhost:8080/api.php
{
  "action": "chat",
  "message": "Hello! Who are you?",
  "model": "ahad-gpt"
}
```

---

### Step 3: PHP Backend Receives It
`api.php` (the PHP server) gets the request and thinks:
> "User wants to chat. I need to:
> 1. Save this message to the database
> 2. Send it to Ollama (the AI)
> 3. Stream the response back word-by-word"

`api.php` sends a request to Ollama:
```
POST http://localhost:11434/api/chat
{
  "model": "ahad-gpt",
  "messages": [
    {"role": "system", "content": "You are Ahad-GPT..."},
    {"role": "user", "content": "Hello! Who are you?"}
  ],
  "stream": true
}
```

---

### Step 4: Ollama Runs Your Custom Model
Ollama is your "AI engine." It holds your model.

Your model is called **`ahad-gpt`**.

Where did this model come from? You created it:

```
Base Model:       qwen2.5:1.5b  (downloaded from the internet)
         +         YOUR Modelfile (custom instructions)
         =         ahad-gpt (your custom model)
```

Inside your `Modelfile`:
```modelfile
FROM qwen2.5:1.5b

SYSTEM "You are Ahad-GPT, a custom university AI assistant built by Ahad..."
```

This means the base AI model (Qwen) is told to act like Ahad-GPT.

---

### Step 5: The Model Generates Text
The model "thinks" (running math on your GPU/CPU) and outputs:

```
"I am Ahad-GPT, an AI assistant created to help you..."
```

But it doesn't send the whole thing at once. It streams word-by-word:
```
I
am
Ahad-
GPT
```

---

### Step 6: The Words Flow Back to You

```
Ollama  ──word──▶  api.php  ──word──▶  app.js  ──word──▶  Your Screen
```

Each word appears on your screen as it arrives. This is why it looks like "typing" — just like ChatGPT.

---

### Step 7: It Saves Everything
The PHP backend saves both your message and the AI's reply in `chats.db`.

Next time you reload the page, your conversation history is still there.

---

##  What Each File ACTUALLY Does

| File | What It Is | Simple Analogy |
|------|-----------|----------------|
| `index.html` | Webpage layout | The restaurant menu |
| `style.css` | Colors, fonts, dark mode | The decoration/style |
| `app.js` | Interactivity | Waiter taking your order |
| `api.php` | PHP backend | The kitchen manager |
| `setup.sh` | Installer script | Setup crew on Day 1 |
| `Modelfile` | AI personality recipe | Chef's secret recipe |
| `chats.db` | SQLite database | Guest book / order history |

---

##  The AI Model Stack

```
Qwen2.5-1.5B (Base AI)
    │
    │  "Ahad's custom instructions"
    ▼
ahad-gpt (Your Model)
    │
    ▼  "I help students learn!"
```

**Qwen2.5-1.5B** = An open-source AI model from Alibaba (1.5 billion parameters)

**Modelfile** = You telling Ollama: "Take Qwen and make it respond as Ahad-GPT"

**ahad-gpt** = The resulting custom model

---

##  Why This Is "Your Own Model"

You did NOT:
- Train weights from scratch (that costs millions)
- Copy GPT-4

You DID:
- Download free, open-source Qwen weights
- Apply your own "personality layer" (the `SYSTEM` prompt)
- Name it "Ahad-GPT"
- Host it on your own machine
- Build an interface around it

For a university project, this is exactly "your own model." You didn't buy it or rent it — you configured it and own the system.

---

##  Data Flow Summary

```
YOU          FRONTEND         BACKEND         AI ENGINE        DATABASE
 │              │                │                 │                │
 │  "Hello!"    │                │                 │                │
 │─────────────▶│                │                 │                │
 │              │  POST request  │                 │                │
 │              │───────────────▶│                 │                │
 │              │                │  "Generate text" │                │
 │              │                │────────────────▶│                │
 │              │                │                 │ "I am Ahad-GPT"│
 │              │                │◀────────────────│                │
 │              │  Stream words  │                 │                │
 │              │◀───────────────│                 │                │
 │  *appears*   │                │                 │                │
 │◀─────────────│                │                 │                │
 │              │                │ "SAVE"           │                │
 │              │                │─────────────────────────────────▶│
```

---

##  Commands You Should Know

```bash
# Run everything
cd ~/Desktop/university-chatgpt
php -S 0.0.0.0:8080        # Start web server

# Check Ollama is running
curl http://localhost:11434

# See your model
curl http://localhost:11434/api/tags

# Talk to your model directly (no web UI)
curl http://localhost:11434/api/generate -d '{"model":"ahad-gpt","prompt":"Hi!","stream":false}'

# Reset conversation history
rm chats.db
```

---

##  Is This "Real" AI?

Yes. Qwen2.5-1.5B is a real transformer model (like GPT-3). It has:
- 1.5 billion parameters (neural connections)
- Self-attention mechanism
- Was trained on terabytes of text data

You didn't train it (that costs $$$), but you:
- **Own** the weights (on your disk)
- **Customize** its personality
- **Run** it privately (no data sent to OpenAI)
- **Build** the interface around it

This is exactly how real local AI systems work.
