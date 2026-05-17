// ============ GHOST S1 Chat Terminal ============
const API_URL = window.location.origin + '/api.php';

const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

let currentChatId = null;
let activeModel = 'ghost-s1';
let isGenerating = false;

document.addEventListener('DOMContentLoaded', () => {
    messageInput.focus();
    animateStatusBars();
});

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

// Model Power Toggle
let modelPowered = true;
const powerToggle = document.getElementById('ghost-power');
const powerText = document.getElementById('power-text');
const modelBadge = document.getElementById('model-badge');
const onlineStatus = document.querySelector('.online-status .status-text');
const onlineDot = document.querySelector('.online-status .status-dot');

async function setModelPower(on) {
    modelPowered = on;
    updatePowerUI(on);
    try {
        const resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'model_power', state: on ? 'on' : 'off', model: 'ghost-s1' })
        });
        const data = await resp.json();
        if (data.status) modelPowered = data.status === 'on';
    } catch (e) {
        console.error('setModelPower error:', e);
    }
}

function updatePowerUI(on) {
    if (on) {
        if (powerText) { powerText.textContent = 'ON'; powerText.classList.remove('off'); }
        if (onlineStatus) onlineStatus.textContent = 'ONLINE';
        if (onlineDot) onlineDot.style.background = 'var(--neon-green)';
        if (modelBadge) modelBadge.textContent = 'ghost-s1';
    } else {
        if (powerText) { powerText.textContent = 'OFF'; powerText.classList.add('off'); }
        if (onlineStatus) onlineStatus.textContent = 'OFFLINE';
        if (onlineDot) onlineDot.style.background = '#ff3333';
        if (modelBadge) modelBadge.textContent = 'OFF';
    }
}

if (powerToggle) {
    powerToggle.addEventListener('change', () => setModelPower(powerToggle.checked));
    // Also handle click to ensure click fires even if change doesn't
    powerToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        setTimeout(() => setModelPower(powerToggle.checked), 0);
    });
}

async function loadModelStatus() {
    try {
        const resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'model_power' })
        });
        const data = await resp.json();
        modelPowered = data.status === 'on';
        if (powerToggle) powerToggle.checked = modelPowered;
        updatePowerUI(modelPowered);
    } catch (e) {}
}

// =========== PANEL SYSTEM ===========
const navPanel = document.getElementById('nav-panel');
const panelTitle = document.getElementById('panel-title');
const panelContent = document.getElementById('panel-content');
const panelClose = document.getElementById('panel-close');

function openPanel(title, htmlBuilder) {
    if (panelTitle) panelTitle.textContent = title;
    if (panelContent) panelContent.innerHTML = typeof htmlBuilder === 'function' ? htmlBuilder() : htmlBuilder;
    if (navPanel) {
        navPanel.classList.add('visible');
        // push chat content aside visually — keep messages reachable
        chatContainer.style.opacity = '0.15';
        chatContainer.style.pointerEvents = 'none';
    }
    // pause ghost idle return timer while panel is open
    if (typeof GhostMind !== 'undefined' && GhostMind.timers.idleReturn) {
        clearTimeout(GhostMind.timers.idleReturn);
        GhostMind.timers.idleReturn = null;
    }
}

function closePanel() {
    if (navPanel) navPanel.classList.remove('visible');
    chatContainer.style.opacity = '1';
    chatContainer.style.pointerEvents = '';
    // resume ghost background sway if hidden boot
    const boot = document.getElementById('boot-screen');
    if (!boot || boot.style.display === 'none') {
        if (typeof GhostMind !== 'undefined') GhostMind.transitionTo('IDLE');
    }
}

if (panelClose) panelClose.addEventListener('click', closePanel);

function renderHistoryPanel(chats) {
    console.log('[renderHistoryPanel] chats type:', typeof chats, 'isArray:', Array.isArray(chats), 'length:', chats ? chats.length : 0);
    if (!Array.isArray(chats) || chats.length === 0) {
        return '<div class="empty-msg">NO CHAT HISTORY FOUND.</div>';
    }
    return chats.map(function(c) {
        const date = c.created_at ? new Date(c.created_at).toLocaleDateString() : '---';
        const title = escapeHtml(c.title || 'Untitled Chat');
        const modelTag = c.model ? '<span class="chat-model">' + escapeHtml(c.model) + '</span>' : '';
        return (
            '<div class="chat-row" data-chatid="' + (c.id || 0) + '" role="button" tabindex="0">' +
                '<div class="chat-left">' +
                    '<span class="chat-title">' + title + '</span>' +
                    modelTag +
                '</div>' +
                '<div class="chat-right">' +
                    '<span class="chat-meta">' + date + '</span>' +
                    '<button class="chat-delete" data-delid="' + (c.id || 0) + '" title="delete chat">×</button>' +
                '</div>' +
            '</div>'
        );
    }).join('');
}

async function loadChatList() {
    try {
        console.log('[loadChatList] fetching list_chats...');
        const resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'list_chats' })
        });
        console.log('[loadChatList] response status:', resp.status);
        const data = await resp.json();
        console.log('[loadChatList] data type:', typeof data, 'isArray:', Array.isArray(data));

        const html = renderHistoryPanel(data);
        openPanel('CHAT HISTORY', html);

        // attach click handlers for rows
        const rows = panelContent.querySelectorAll('.chat-row');
        console.log('[loadChatList] attaching handlers to', rows.length, 'rows');
        rows.forEach(function(row) {
            row.addEventListener('click', function(e) {
                if (e.target.closest('.chat-delete')) return;
                const id = row.dataset.chatid;
                console.log('[loadChatList] row clicked, chatid:', id);
                if (id) loadChat(id);
            });
        });
        panelContent.querySelectorAll('.chat-delete').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = btn.dataset.delid;
                console.log('[loadChatList] delete clicked:', id);
                if (id && confirm('Delete chat #' + id + '?')) deleteChat(id);
            });
        });
    } catch (e) {
        openPanel('CHAT HISTORY', '<div class="empty-msg">FAILED TO LOAD HISTORY.</div>');
        console.error('[loadChatList] error:', e);
    }
}

async function loadChat(chatId) {
    try {
        const resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'load_chat', chat_id: parseInt(chatId,10) })
        });
        const data = await resp.json();
        if (data.error) { alert(data.error); return; }
        currentChatId = data.id || chatId;
        chatContainer.innerHTML = '';
        hideBootScreen();
        if (data.messages && data.messages.length) {
            data.messages.forEach(function(m) {
                addMessage(m.content, m.role === 'user' ? 'user' : 'ghost');
            });
        }
        closePanel();
        setGhostMood('IDLE');
    } catch (e) {
        console.error(e);
    }
}

async function deleteChat(chatId) {
    try {
        const resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete_chat', chat_id: parseInt(chatId,10) })
        });
        const data = await resp.json();
        if (data.success) loadChatList();
    } catch (e) {
        console.error(e);
    }
}

function renderSystemStatus() {
    return (
        '<div class="status-grid">' +
            '<div class="status-tile"><span class="tile-label">Uptime</span><span class="tile-value" id="status-uptime">0s</span><span class="tile-sub">since boot</span></div>' +
            '<div class="status-tile"><span class="tile-label">Model</span><span class="tile-value">ghost-s1</span><span class="tile-sub">qwen2.5:1.5b</span></div>' +
            '<div class="status-tile"><span class="tile-label">Messages</span><span class="tile-value" id="status-msgs">0</span><span class="tile-sub">this session</span></div>' +
            '<div class="status-tile"><span class="tile-label">Backend</span><span class="tile-value">PHP+SQLite</span><span class="tile-sub">local only</span></div>' +
        '</div>'
    );
}

function renderModelsPanel(models) {
    if (!Array.isArray(models) || models.length === 0) {
        return '<div class="empty-msg">NO MODELS FOUND.</div>';
    }
    var currentModel = (typeof activeModel !== 'undefined' && activeModel) ? activeModel : 'ghost-s1';
    return models.map(function(m) {
        var isActive = m.name === currentModel;
        var activeCls = isActive ? ' active' : '';
        var tagHtml = m.custom ? '<div class="model-tag">CUSTOM</div>' : '<div class="model-tag">OLLAMA</div>';
        return (
            '<div class="model-card' + activeCls + '" data-model="' + escapeHtml(m.name) + '" title="Click to switch" style="cursor:pointer;">' +
                '<div class="model-row">' +
                    '<div class="model-name">' + escapeHtml(m.label || m.name) + (isActive ? ' <span class="model-active-dot">●</span>' : '') + '</div>' +
                    '<div class="model-actions">' + tagHtml + '</div>' +
                '</div>' +
                '<div class="model-id">' + escapeHtml(m.name) + '</div>' +
            '</div>'
        );
    }).join('');
}

async function loadModelPanel() {
    try {
        var resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'list_models' })
        });
        var models = await resp.json();
        openPanel('MODELS', function() { return renderModelsPanel(models); });
        // attach click handlers after panel DOM is ready
        function onCardClick() {
            var modelName = this.dataset.model;
            if (!modelName) return;
            activeModel = modelName;
            var modelBadge = document.getElementById('model-badge');
            if (modelBadge) modelBadge.textContent = modelName;
            openPanel('MODELS', function() { return renderModelsPanel(models); });
            setTimeout(function() {
                panelContent.querySelectorAll('.model-card').forEach(function(c) {
                    c.addEventListener('click', onCardClick);
                });
            }, 0);
        }
        setTimeout(function() {
            panelContent.querySelectorAll('.model-card').forEach(function(card) {
                card.addEventListener('click', onCardClick);
            });
        }, 0);
    } catch (e) {
        openPanel('MODELS', '<div class="empty-msg">FAILED TO LOAD MODELS.</div>');
        console.error(e);
    }
}

function renderSettingsPanel() {
    const S = (k, d) => localStorage.getItem('ghost_'+k) ?? d;
    const mkRow  = (label, inputHtml) => '<div class="setting-row"><label>'+label+'</label>'+inputHtml+'</div>';
    const mkNum  = (id, val, min, max, step) => '<input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'"><span class="setting-val" id="'+id+'-val">'+val+'</span>';
    const mkTxt  = (id, val, ph) => '<input type="text" id="'+id+'" value="'+val+'" placeholder="'+ph+'">';
    return (
        '<div class="settings-group">' +
            mkRow('Temperature', mkNum('set-temp', S('temperature','0.7'), '0', '2', '0.05')) +
            mkRow('Max Tokens', mkNum('set-maxtokens', S('max_tokens','512'), '32', '4096', '32')) +
            mkRow('Top P', mkNum('set-topp', S('top_p','0.8'), '0', '1', '0.05')) +
            mkRow('Top K', mkNum('set-topk', S('top_k','20'), '1', '128', '1')) +
            mkRow('Repeat Penalty', mkNum('set-repeat', S('repeat_penalty','1.2'), '1', '2', '0.05')) +
            mkRow('Frequency Penalty', mkNum('set-freq', S('frequency_penalty','0'), '-2', '2', '0.1')) +
            mkRow('Presence Penalty', mkNum('set-presence', S('presence_penalty','0'), '-2', '2', '0.1')) +
            mkRow('System Prompt', '<textarea id="set-system" rows="2" placeholder="Optional system prompt override">'+escapeHtml(S('system_prompt',''))+'</textarea>') +
        '</div>' +
        '<div class="setting-row" style="border-bottom:none;margin-top:6px;justify-content:center">' +
            '<button id="btn-save-settings" class="send-btn" style="padding:6px 18px;font-size:12px;">SAVE SETTINGS</button>' +
        '</div>'
    );
}

function renderDocsPanel() {
    return (
        '<div class="docs-text">' +
            '<h4>Architecture</h4>' +
            '<p>GHOST S1 is a local ChatGPT clone built by Abdul Ahad. Frontend: HTML+CSS+JS. Backend: PHP proxy to Ollama (port 11434). Storage: SQLite <code>chats.db</code>. Model: Qwen2.5:1.5b with a custom Modelfile.</p>' +
            '<h4>Chat Flow</h4>' +
            '<p>1. User types a message.<br>2. JS sends <code>{action:"chat", message, chat_id}</code> to <code>api.php</code>.<br>3. PHP forwards to Ollama via streaming HTTP.<br>4. PHP buffers chunks and echoes JSON lines.<br>5. JS renders each chunk into a ghost message bubble.</p>' +
            '<h4>GhostMind</h4>' +
            '<p>A lightweight emotion state machine inside <code>app.js</code>. It tracks happiness, curiosity, energy, confidence, and attention. Context events (engagement, success, error, idle) shift these values. The dominant emotion becomes the ghost face expression.</p>' +
            '<h4>Shortcuts</h4>' +
            '<p><code>Enter</code> — send message<br><code>Esc</code> — close panel</p>' +
        '</div>'
    );
}

// menu handlers
document.querySelectorAll('.menu-item').forEach(function(item) {
    item.addEventListener('click', function() {
        document.querySelectorAll('.menu-item').forEach(function(i) { i.classList.remove('active'); });
        item.classList.add('active');
        var action = item.dataset.action;
        if (action === 'new-chat') { closePanel(); startNewChat(); }
        else if (action === 'chats') loadChatList();
        else if (action === 'status') openPanel('SYSTEM STATUS', renderSystemStatus());
        else if (action === 'models') loadModelPanel();
        else if (action === 'settings') {
            openPanel('SETTINGS', renderSettingsPanel());
            setTimeout(function() {
                ['set-temp','set-maxtokens','set-topp','set-topk','set-repeat','set-freq','set-presence'].forEach(function(id){
                    var el = document.getElementById(id);
                    var valEl = document.getElementById(id+'-val');
                    if (el && valEl) {
                        el.addEventListener('input', function() { valEl.textContent = el.value; });
                    }
                });
                var saveBtn = document.getElementById('btn-save-settings');
                if (saveBtn) saveBtn.addEventListener('click', function() {
                    var fields = {
                        temperature:          document.getElementById('set-temp').value,
                        max_tokens:           document.getElementById('set-maxtokens').value,
                        top_p:                document.getElementById('set-topp').value,
                        top_k:                document.getElementById('set-topk').value,
                        repeat_penalty:       document.getElementById('set-repeat').value,
                        frequency_penalty:    document.getElementById('set-freq').value,
                        presence_penalty:     document.getElementById('set-presence').value,
                        system_prompt:        document.getElementById('set-system').value
                    };
                    Object.keys(fields).forEach(function(k){
                        if (fields[k] !== null && fields[k] !== '') localStorage.setItem('ghost_'+k, fields[k]);
                    });
                    saveBtn.textContent = 'SAVED   ';
                    setTimeout(function() { saveBtn.textContent = 'SAVE SETTINGS'; }, 1200);
                });
            }, 0);
        }
        else if (action === 'docs') openPanel('HOW IT WORKS', renderDocsPanel());
    });
});

// close panel on Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closePanel();
});

document.querySelectorAll('.qa-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        var action = btn.dataset.action;
        var prompts = {
            'summarize': 'summarize this:',
            'code': 'write code for:',
            'analyze': 'analyze this:',
            'image': 'generate image:',
            'search': 'search for:'
        };
        messageInput.value = prompts[action] || '';
        messageInput.focus();
    });
});

let startTime = Date.now();
function startUptime() {
    setInterval(() => {
        const diff = Math.floor((Date.now() - startTime) / 1000);
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        uptimeEl.textContent = `${h}h ${m}m ${s}s`;
    }, 1000);
}

function animateStatusBars() {
    setInterval(() => {
        document.querySelectorAll('.status-fill').forEach(bar => {
            const base = parseInt(bar.style.width) || 50;
            const newVal = Math.max(10, Math.min(100, base + Math.floor(Math.random() * 10) - 5));
            bar.style.width = newVal + '%';
            bar.parentElement.nextElementSibling.textContent = newVal + '%';
        });
    }, 3000);
}

function startNewChat() {
    currentChatId = null;
    // Preserve boot screen, destroy only messages
    const boot = document.getElementById('boot-screen');
    if (chatContainer) chatContainer.style.paddingTop = '20px';
    chatContainer.innerHTML = '';
    if (boot) {
        boot.style.opacity = '1';
        boot.style.display = 'flex';
        chatContainer.appendChild(boot);
    }
    messageInput.value = '';
    messageInput.focus();
    setGhostMood('IDLE');
    const face = document.getElementById('ghost-face');
    if (face) face.classList.remove('visible');
}

function addWelcomeMessages() {
    // welcome messages removed — boot screen handles initial display
    return;
}

function getTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function showGhostFace() {
    const face = document.getElementById('ghost-face');
    if (face) face.classList.add('visible');
}

function scrollToBottom() {
    setTimeout(() => { chatContainer.scrollTop = chatContainer.scrollHeight; }, 10);
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || isGenerating) return;

    // Block if model is OFF
    if (!modelPowered) {
        addMessage('ghost-s1 is OFF. flip the power toggle first.', 'ghost');
        setGhostMood('ERROR');
        if (typeof GhostMind !== 'undefined') GhostMind.applyContext('error');
        setTimeout(() => setGhostMood('IDLE'), 2000);
        return;
    }

    // First message: hide boot screen
    hideBootScreen();
    showGhostFace();

    if (typeof GhostMind !== 'undefined') GhostMind.applyContext('engagement', 8);
    addMessage(text, 'user');
    messageInput.value = '';
    isGenerating = true;
    setGhostMood('THINKING');

    let currentResponse = '';
    let ghostMsgEl = null;

    try {
        // Build options payload from saved settings
        const getNum = (k, d) => {
            const v = localStorage.getItem('ghost_'+k);
            return v ? parseFloat(v) : d;
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'chat',
                message: text,
                chat_id: currentChatId,
                model: activeModel,
                temperature:      getNum('temperature', 0.4),
                max_tokens:       getNum('max_tokens', 512),
                top_p:            getNum('top_p', 0.8),
                top_k:            getNum('top_k', 20),
                repeat_penalty:   getNum('repeat_penalty', 1.3),
                frequency_penalty:getNum('frequency_penalty', 0),
                presence_penalty: getNum('presence_penalty', 0)
            })
        });

        if (!response.ok) throw new Error('Network error');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                if (trimmed.startsWith('{"chat_id"')) {
                    try {
                        const finalJson = JSON.parse(trimmed);
                        if (finalJson.chat_id) currentChatId = finalJson.chat_id;
                    } catch (e) {}
                    continue;
                }

                try {
                    const data = JSON.parse(trimmed);
                    if (data.message && data.message.content) {
                        currentResponse += data.message.content;

                        if (!ghostMsgEl) {
                            const html = `
                                <div class="chat-message ghost-msg" id="live-msg">
                                    <div class="msg-header">
                                        <svg class="msg-ghost-icon" viewBox="0 0 32 32">
                                            <rect x="10" y="4" width="12" height="2" fill="#9d00ff"/>
                                            <rect x="8" y="6" width="16" height="2" fill="#9d00ff"/>
                                            <rect x="6" y="8" width="20" height="14" fill="#9d00ff"/>
                                            <rect x="6" y="22" width="4" height="2" fill="#9d00ff"/>
                                            <rect x="12" y="22" width="4" height="2" fill="#9d00ff"/>
                                            <rect x="18" y="22" width="4" height="2" fill="#9d00ff"/>
                                            <rect x="24" y="22" width="2" height="2" fill="#9d00ff"/>
                                        </svg>
                                        <span class="msg-time">${getTime()}</span>
                                        <span class="msg-sender">GHOST S1</span>
                                    </div>
                                    <div class="msg-body" id="live-body"></div>
                                </div>
                            `;
                            chatContainer.insertAdjacentHTML('beforeend', html);
                            ghostMsgEl = document.getElementById('live-msg');
                        }

                        const liveBody = document.getElementById('live-body');
                        if (liveBody) liveBody.textContent = currentResponse;
                        scrollToBottom();
                    }
                } catch (e) {}
            }
        }

        if (ghostMsgEl) {
            ghostMsgEl.removeAttribute('id');
            const body = ghostMsgEl.querySelector('.msg-body');
            if (body) body.removeAttribute('id');
        }
        setGhostMood('SUCCESS');
        if (typeof GhostMind !== 'undefined') GhostMind.applyContext('success');

    } catch (err) {
        addMessage('connection fucked. try again.', 'ghost');
        setGhostMood('ERROR');
        console.error(err);
    }

    isGenerating = false;
    setTimeout(() => setGhostMood('IDLE'), 3000);
}

function addMessage(text, sender) {
    const isGhost = sender === 'ghost';
    const iconSvg = isGhost ? `
        <svg class="msg-ghost-icon" viewBox="0 0 32 32">
            <rect x="10" y="4" width="12" height="2" fill="#9d00ff"/>
            <rect x="8" y="6" width="16" height="2" fill="#9d00ff"/>
            <rect x="6" y="8" width="20" height="14" fill="#9d00ff"/>
            <rect x="6" y="22" width="4" height="2" fill="#9d00ff"/>
            <rect x="12" y="22" width="4" height="2" fill="#9d00ff"/>
            <rect x="18" y="22" width="4" height="2" fill="#9d00ff"/>
            <rect x="24" y="22" width="2" height="2" fill="#9d00ff"/>
            <rect x="6" y="24" width="2" height="2" fill="#9d00ff"/>
            <rect x="10" y="24" width="2" height="2" fill="#9d00ff"/>
            <rect x="14" y="24" width="2" height="2" fill="#9d00ff"/>
            <rect x="18" y="24" width="2" height="2" fill="#9d00ff"/>
            <rect x="22" y="24" width="2" height="2" fill="#9d00ff"/>
            <rect x="10" y="12" width="4" height="4" fill="#000"/>
            <rect x="18" y="12" width="4" height="4" fill="#000"/>
        </svg>` : '';
    const senderName = isGhost ? 'GHOST S1' : 'OPERATOR';
    const senderColor = isGhost ? 'var(--neon-purple)' : '#fff';
    const msgBodyClass = isGhost ? 'msg-body' : 'msg-body user-msg';

    const html = `
        <div class="chat-message ${isGhost ? 'ghost-msg' : 'user-msg'}">
            <div class="msg-header">
                ${iconSvg}
                <span class="msg-time">${getTime()}</span>
                <span class="msg-sender" style="color:${senderColor}">${senderName}</span>
            </div>
            <div class="${msgBodyClass}">${escapeHtml(text)}</div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function showTyping() {
    hideTyping();
    const html = `
        <div class="typing-indicator" id="typing">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function hideTyping() {
    const typing = document.getElementById('typing');
    if (typing) typing.remove();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function hideBootScreen() {
    const boot = document.getElementById('boot-screen');
    if (boot) {
        boot.style.opacity = '0';
        boot.style.transition = 'opacity 0.6s ease';
        setTimeout(() => { boot.style.display = 'none'; }, 600);
    }
    // Shift messages down so they don't hide behind the HUD ghost face
    if (chatContainer) chatContainer.style.paddingTop = '72px';
}

function setGhostMood(mood) {
    if (typeof GhostMind !== 'undefined') {
        GhostMind.transitionTo(mood);
    } else {
        const sidebarText = document.querySelector('.sidebar-footer .status-text');
        if (sidebarText) sidebarText.textContent = mood;
    }
}

// Duplicate loadChatList REMOVED — see earlier definition at ~line 146

async function updateSystemStatus() {
    try {
        const resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'system_status' })
        });
        const data = await resp.json();

        const sysEl = document.getElementById('sys-status');
        const memEl = document.getElementById('mem-status');
        const cpuEl = document.getElementById('cpu-status');
        const memFill = document.getElementById('mem-fill');
        const cpuFill = document.getElementById('cpu-fill');
        const modelBadge = document.getElementById('model-badge');

        if (sysEl) sysEl.textContent = data.sys ?? 'READY';
        if (memEl) memEl.textContent = (data.mem ?? 0) + '%';
        if (cpuEl) cpuEl.textContent = (data.cpu ?? 0) + '%';

        if (memFill) {
            memFill.style.width = Math.min(100, data.mem ?? 0) + '%';
            memFill.classList.toggle('medium', data.mem >= 50 && data.mem < 80);
            memFill.classList.toggle('high', data.mem >= 80);
        }
        if (cpuFill) {
            cpuFill.style.width = Math.min(100, data.cpu ?? 0) + '%';
            cpuFill.classList.toggle('medium', data.cpu >= 50 && data.cpu < 80);
            cpuFill.classList.toggle('high', data.cpu >= 80);
        }
        if (modelBadge) modelBadge.textContent = data.model ?? 'ghost-s1';
    } catch (e) {
        console.error(e);
    }
}

updateSystemStatus();
loadModelStatus();
setInterval(updateSystemStatus, 5000);

// =========== GHOST EMOTION ENGINE ===========
const EMOTIONS = ['IDLE','HAPPY','THINKING','CURIOUS','CONFUSED','SLEEPY','SURPRISED','ANNOYED','ERROR','SUCCESS','NEUTRAL'];
const LOOK_DIRS = ['look-left','look-right','look-center','look-up','look-down'];

function clearEmotionClasses(el) {
    if (!el) return;
    EMOTIONS.forEach(function(e) { el.classList.remove('face-' + e.toLowerCase()); });
    LOOK_DIRS.forEach(function(d) { el.classList.remove('face-' + d); });
    el.classList.remove('face-blinking');
}

const GhostMind = {
    state: { happiness: 50, curiosity: 50, energy: 80, confidence: 70, attention: 60 },
    emotion: 'IDLE',
    timers: { blink: null, look: null, decay: null, idleReturn: null },
    initialized: false,

    applyContext: function(event, intensity) {
        intensity = intensity || 10;
        var s = this.state;
        switch(event) {
            case 'greeting': s.happiness = Math.min(100, s.happiness + intensity); break;
            case 'unusual_question': s.curiosity = Math.min(100, s.curiosity + intensity); break;
            case 'long_conversation': s.energy = Math.max(0, s.energy - 5); break;
            case 'uncertain': s.confidence = Math.max(0, s.confidence - intensity); break;
            case 'engagement': s.attention = Math.min(100, s.attention + intensity); s.happiness = Math.min(100, s.happiness + 3); break;
            case 'success': s.happiness = Math.min(100, s.happiness + 15); s.confidence = Math.min(100, s.confidence + 10); break;
            case 'error': s.confidence = Math.max(0, s.confidence - 20); s.happiness = Math.max(0, s.happiness - 10); break;
            case 'idle': s.energy = Math.max(20, s.energy - 2); s.attention = Math.max(20, s.attention - 3); break;
        }
        this.recomputeEmotion();
    },

    recomputeEmotion: function() {
        var s = this.state;
        var e = 'IDLE';
        if (this.emotion === 'ERROR' || this.emotion === 'SUCCESS') return; // transient, let idle-return timer handle it
        if (s.energy < 25) e = 'SLEEPY';
        else if (s.confidence < 25) e = 'CONFUSED';
        else if (s.happiness > 80 && s.confidence > 60) e = 'HAPPY';
        else if (s.happiness < 25 && s.confidence < 40) e = 'ANNOYED';
        else if (s.attention > 85 && s.curiosity > 70) e = 'SURPRISED';
        else if (s.curiosity > 75 && s.attention > 55) e = 'CURIOUS';
        else if (s.curiosity > 60 && s.attention > 50 && s.energy > 40) e = 'THINKING';
        else if (s.energy > 60 && s.happiness >= 35 && s.happiness <= 70 && s.attention < 70) e = 'IDLE';
        else e = 'NEUTRAL';
        this.transitionTo(e);
    },

    transitionTo: function(emotion) {
        if (this.emotion === emotion) return;
        this.emotion = emotion;
        var bootFace = document.getElementById('boot-face');
        var persistFace = document.getElementById('ghost-face');
        clearEmotionClasses(bootFace);
        clearEmotionClasses(persistFace);
        var cls = 'face-' + emotion.toLowerCase();
        if (bootFace) bootFace.classList.add(cls);
        if (persistFace) persistFace.classList.add(cls);
        var bfMood = document.getElementById('bf-mood');
        if (bfMood) bfMood.textContent = emotion;
        if (this.timers.idleReturn) clearTimeout(this.timers.idleReturn);
        if (['HAPPY','SURPRISED','ERROR','SUCCESS'].indexOf(emotion) >= 0) {
            var delay = emotion === 'ERROR' ? 4000 : 2500;
            var self = this;
            this.timers.idleReturn = setTimeout(function() { self.transitionTo('IDLE'); }, delay);
        }
    },

    blink: function() {
        var bootFace = document.getElementById('boot-face');
        if (bootFace && !bootFace.classList.contains('face-error')) {
            bootFace.classList.add('face-blinking');
            setTimeout(function() { bootFace.classList.remove('face-blinking'); }, 120);
        }
        this.scheduleBlink();
    },

    scheduleBlink: function() {
        var t = 1500 + Math.random() * 5000;
        var self = this;
        this.timers.blink = setTimeout(function() { self.blink(); }, t);
    },

    lookAround: function() {
        var bootFace = document.getElementById('boot-face');
        if (!bootFace || this.emotion === 'THINKING' || this.emotion === 'SLEEPY') return;
        LOOK_DIRS.forEach(function(d) { bootFace.classList.remove('face-' + d); });
        var dir = LOOK_DIRS[Math.floor(Math.random() * LOOK_DIRS.length)];
        bootFace.classList.add('face-' + dir);
    },

    startLooking: function() {
        var self = this;
        this.timers.look = setInterval(function() { self.lookAround(); }, 3500 + Math.random() * 2000);
    },

    decay: function() {
        this.applyContext('idle');
        var s = this.state;
        s.happiness = s.happiness * 0.95 + 50 * 0.05;
        s.curiosity = s.curiosity * 0.95 + 50 * 0.05;
        s.confidence = s.confidence * 0.95 + 70 * 0.05;
        s.attention = s.attention * 0.95 + 50 * 0.05;
        s.energy = s.energy * 0.99 + 80 * 0.01;
        this.recomputeEmotion();
    },

    startDecay: function() {
        var self = this;
        this.timers.decay = setInterval(function() { self.decay(); }, 6000);
    },

    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        this.transitionTo('IDLE');
        this.scheduleBlink();
        this.startLooking();
        this.startDecay();
    }
};

GhostMind.init();
