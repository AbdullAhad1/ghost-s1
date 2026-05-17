#!/bin/bash
# setup.sh — One-shot installer for GHOST S1  
# Usage: cd ~/Desktop/university-chatgpt && bash setup.sh
# Works on: macOS, Linux

set -e

echo "╔════════════════════════════════════════════╗"
echo "║  GHOST S1 Setup (Mac / Linux)              ║"
echo "╚════════════════════════════════════════════╝"
echo ""

MODEL_BASE="qwen2.5:1.5b"
MODEL_NAME="ghost-s1"

echo "[1/5] Checking Ollama..."
if ! command -v ollama &> /dev/null; then
    echo "  Ollama not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ollama
        else
            curl -fsSL https://ollama.com/install.sh | sh
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://ollama.com/install.sh | sh
    else
        echo "Unsupported OS. Install Ollama manually: https://ollama.com"
        exit 1
    fi
else
    echo "  Ollama is installed."
fi

echo ""
echo "[2/5] Starting Ollama server..."
if ! curl -s http://localhost:11434 | grep -q "Ollama is running"; then
    echo "  Ollama is not running. Starting in background..."
    nohup ollama serve > /tmp/ollama.log 2>&1 &
    sleep 3
fi

echo "  Ollama is running."

echo ""
echo "[3/5] Pulling base model ($MODEL_BASE)..."
ollama pull $MODEL_BASE

echo ""
echo "[4/5] Creating custom model '$MODEL_NAME'..."

if [ ! -f "Modelfile-ghost" ]; then
    echo "  ERROR: Modelfile-ghost not found."
    exit 1
fi

ollama create $MODEL_NAME -f Modelfile-ghost

echo "  Model '$MODEL_NAME' created."

echo ""
echo "[5/5] Setting up chat database..."
php -r "
\$db = new PDO('sqlite:chats.db');
\$db->exec('CREATE TABLE IF NOT EXISTS chats (id INTEGER PRIMARY KEY, title TEXT, model TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
\$db->exec('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, chat_id INTEGER, role TEXT, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
echo \"  Database ready.\n\";
"

echo ""
echo "════════════════════════════════════════════"
echo "✓ Setup complete!"
echo ""
echo "Start the project:"
echo "  cd $(pwd)"
echo "  php -S 0.0.0.0:8080"
echo ""
echo "Then open: http://localhost:8080"
echo ""
echo "Your custom model: $MODEL_NAME"
echo "════════════════════════════════════════════"
