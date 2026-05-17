const pptxgen = require("pptxgenjs");
const path = require("path");
const os = require("os");

let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Ahad";
pres.title = "Ahad-GPT: Custom Local LLM Project";
pres.subject = "University PHP Project - Custom AI Assistant";

const outputPath = path.join(os.homedir(), "Desktop/university-chatgpt/Ahad-GPT-Presentation.pptx");

// ── Color Palette (Midnight AI Teal) ──
const colors = {
    bg: "0B0F19",
    bgLight: "121827",
    accent: "00D4AA",
    accentSoft: "14C8A6",
    accentDim: "0A8C6E",
    ice: "7DD3FC",
    slate: "94A3B8",
    white: "F0F4F8",
    offWhite: "E2E8F0",
    divider: "1E293B",
};

// ── Helper: Add accent bar ──
function addAccentBar(slide, y = 0.3) {
    slide.addShape(pres.shapes.RECTANGLE, {
        x: 0, y: y, w: 0.12, h: 0.45,
        fill: { color: colors.accent }
    });
}

// ── SLIDE 1: Title ──
{
    let slide = pres.addSlide();
    slide.background = { color: colors.bg };
    // Decorative accent shapes
    slide.addShape(pres.shapes.RECTANGLE, {
        x: 7.0, y: 0, w: 3, h: 5.625,
        fill: { color: "111827" },
    });
    slide.addShape(pres.shapes.RECTANGLE, {
        x: 7.0, y: 0, w: 0.06, h: 5.625,
        fill: { color: colors.accent },
    });
    // Title
    slide.addText("Ahad-GPT", {
        x: 0.8, y: 1.8, w: 5.5, h: 1.0,
        fontSize: 52, fontFace: "Arial Black", color: colors.white,
        bold: true, align: "left", margin: 0,
    });
    // Subtitle
    slide.addText("Building a Custom ChatGPT with Open-Source LLM \\nvia Ollama, PHP & Modern Web Stack", {
        x: 0.8, y: 2.9, w: 5.5, h: 1.2,
        fontSize: 18, fontFace: "Arial", color: colors.ice,
        align: "left", margin: 0, lineSpacing: 26,
    });
    // Bottom metadata
    slide.addText("AI & Software Engineering  \\u2022  University Project  \\u2022  2026", {
        x: 0.8, y: 4.4, w: 5.5, h: 0.4,
        fontSize: 14, fontFace: "Arial", color: colors.slate,
        align: "left", margin: 0,
    });
    // Big AI icon
    slide.addText("▸", {
        x: 7.8, y: 2.0, w: 1.5, h: 1.5,
        fontSize: 64, color: colors.accent,
        align: "center", valign: "middle", margin: 0,
    });
    slide.addText("LOCAL AI", {
        x: 7.2, y: 3.3, w: 2.2, h: 0.4,
        fontSize: 12, color: colors.accent,
        align: "center", margin: 0, letterSpacing: 6,
    });
}

// ── SLIDE 2: What is this project? ──
{
    let slide = pres.addSlide();
    slide.background = { color: colors.bg };
    addAccentBar(slide);
    slide.addText("Project Overview", {
        x: 0.5, y: 0.3, w: 8, h: 0.5,
        fontSize: 28, fontFace: "Arial", color: colors.accent,
        bold: true, margin: 0,
    });
    slide.addText("A custom chatbot that runs entirely on your laptop — no OpenAI keys, no cloud dependency.", {
        x: 0.5, y: 0.95, w: 9, h: 0.5,
        fontSize: 16, color: colors.offWhite, margin: 0,
    });
    // 3 cards
    const cards = [
        { title: "Custom Model", desc: "Applied a custom system prompt to an open-source model, rebranding it as \"Ahad-GPT\"" },
        { title: "Local Inference", desc: "Uses Ollama to run Qwen2.5-1.5B on the MacBook with zero latency or data leakage" },
        { title: "Full-Stack App", desc: "PHP REST API + SQLite persistence + vanilla JS frontend with streaming UI" },
    ];
    cards.forEach((card, i) => {
        let cx = 0.5 + i * 3.2;
        slide.addShape(pres.shapes.RECTANGLE, {
            x: cx, y: 1.7, w: 2.9, h: 3.2,
            fill: { color: colors.bgLight },
            line: { color: colors.divider, width: 1 },
        });
        slide.addText(card.title, {
            x: cx + 0.2, y: 2.0, w: 2.5, h: 0.4,
            fontSize: 16, color: colors.accent, bold: true, margin: 0,
        });
        slide.addText(card.desc, {
            x: cx + 0.2, y: 2.5, w: 2.5, h: 2.2,
            fontSize: 13, color: colors.slate, margin: 0, lineSpacing: 18,
        });
    });
}

// ── SLIDE 3: Why "Local" matters ──
{
    let slide = pres.addSlide();
    slide.background = { color: colors.bg };
    addAccentBar(slide);
    slide.addText("Why Local AI?", {
        x: 0.5, y: 0.3, w: 9, h: 0.5,
        fontSize: 28, fontFace: "Arial", color: colors.accent, bold: true, margin: 0,
    });
    // Comparison table
    slide.addTable([
        [
            { text: "", options: { fill: { color: "0B0F19" }, color: colors.accent, bold: true, fontSize: 14 } },
            { text: "ChatGPT (Cloud)", options: { fill: { color: "0B0F19" }, color: colors.ice, bold: true, fontSize: 14, align: "center" } },
            { text: "Ahad-GPT (Local)", options: { fill: { color: "0B0F19" }, color: colors.accent, bold: true, fontSize: 14, align: "center" } },
        ],
        [
            { text: "API Cost", options: { color: colors.slate, bold: true, fontSize: 13 } },
            { text: "Subscription ($20/mo)", options: { color: colors.slate, fontSize: 13, align: "center" } },
            { text: "Free (open-source)", options: { color: colors.accent, fontSize: 13, align: "center" } },
        ],
        [
            { text: "Privacy", options: { color: colors.slate, bold: true, fontSize: 13 } },
            { text: "Data sent to OpenAI", options: { color: colors.slate, fontSize: 13, align: "center" } },
            { text: "100% on-device, zero data leakage", options: { color: colors.accent, fontSize: 13, align: "center" } },
        ],
        [
            { text: "Latency", options: { color: colors.slate, bold: true, fontSize: 13 } },
            { text: "Network-dependent", options: { color: colors.slate, fontSize: 13, align: "center" } },
            { text: "~50-200ms local", options: { color: colors.accent, fontSize: 13, align: "center" } },
        ],
        [
            { text: "Customization", options: { color: colors.slate, bold: true, fontSize: 13 } },
            { text: "Limited (prompts only)", options: { color: colors.slate, fontSize: 13, align: "center" } },
            { text: "Full (name, persona, temps)", options: { color: colors.accent, fontSize: 13, align: "center" } },
        ],
        [
            { text: "Offline", options: { color: colors.slate, bold: true, fontSize: 13 } },
            { text: "Requires internet", options: { color: colors.slate, fontSize: 13, align: "center" } },
            { text: "Works without WiFi", options: { color: colors.accent, fontSize: 13, align: "center" } },
        ],
    ], {
        x: 0.5, y: 1.15, w: 9, h: 3.5,
        colW: [3.5, 2.75, 2.75],
        border: { pt: 0.5, color: colors.divider },
        fill: { color: "0B0F19" },
        fontFace: "Arial",
        margin: [0.08, 0.05],
        valign: "middle",
    });
    slide.addText("The goal: prove that anyone can run their own AI without a third-party API.", {
        x: 0.5, y: 4.9, w: 9, h: 0.4,
        fontSize: 14, color: colors.slate, align: "center", margin: 0,
    });
}

// ── SLIDE 4: Architecture Overview ──
{
    let slide = pres.addSlide();
    slide.background = { color: colors.bg };
    addAccentBar(slide);
    slide.addText("System Architecture", {
        x: 0.5, y: 0.3, w: 9, h: 0.5,
        fontSize: 28, fontFace: "Arial", color: colors.accent, bold: true, margin: 0,
    });

    // ── Diagram boxes ──
    const boxes = [
        { x: 0.5, y: 1.8, w: 2.0, h: 1.4, title: "Frontend", body: "index.html\\nstyle.css\\napp.js", color: colors.ice },
        { x: 3.2, y: 1.8, w: 2.0, h: 1.4, title: "Backend", body: "api.php (REST)\\nSQLite (chats.db)", color: colors.accentSoft },
        { x: 6.0, y: 1.8, w: 2.0, h: 1.4, title: "AI Engine", body: "Ollama (localhost)\\nahad-gpt model", color: colors.accent },
        { x: 8.5, y: 1.8, w: 1.3, h: 1.4, title: "Base", body: "Qwen2.5\\n1.5B weights", color: colors.accentDim },
    ];
    boxes.forEach(b => {
        slide.addShape(pres.shapes.RECTANGLE, {
            x: b.x, y: b.y, w: b.w, h: b.h,
            fill: { color: colors.bgLight },
            line: { color: b.color, width: 2 },
        });
        slide.addText(b.title, {
            x: b.x + 0.1, y: b.y + 0.15, w: b.w - 0.2, h: 0.3,
            fontSize: 12, color: b.color, bold: true, margin: 0, align: "center",
        });
        slide.addText(b.body.replace(/\\n/g, "\n"), {
            x: b.x + 0.1, y: b.y + 0.5, w: b.w - 0.2, h: 0.8,
            fontSize: 10, color: colors.slate, margin: 0, align: "center", lineSpacing: 14,
        });
    });
    // Arrows
    const arrows = [
        { x1: 2.5, y1: 2.5, x2: 3.2, y2: 2.5 },
        { x1: 5.2, y1: 2.5, x2: 6.0, y2: 2.5 },
        { x1: 8.0, y1: 2.5, x2: 8.5, y2: 2.5 },
    ];
    arrows.forEach(a => {
        slide.addShape(pres.shapes.LINE, {
            x: a.x1, y: a.y1, w: a.x2 - a.x1, h: 0,
            line: { color: colors.slate, width: 1.5, endArrowType: "arrow" },
        });
    });

    // Bottom detail text
    slide.addText("Streaming architecture: JavaScript receives responses word-by-word via HTTP chunked transfer, exactly like ChatGPT.", {
        x: 0.5, y: 3.6, w: 9, h: 0.8,
        fontSize: 13, color: colors.slate, margin: 0, lineSpacing: 18, align: "center",
    });
}

// ── SLIDE 5: How the Model Was Customized ──
{
    let slide = pres.addSlide();
    slide.background = { color: colors.bg };
    addAccentBar(slide);
    slide.addText("How the AI was \"Customized\"", {
        x: 0.5, y: 0.3, w: 9, h: 0.5,
        fontSize: 28, fontFace: "Arial", color: colors.accent, bold: true, margin: 0,
    });
    // 3-step process
    const steps = [
        { num: "01", title: "Download Base Model", desc: "ollama pull qwen2.5:1.5b\\n(986MB of pre-trained weights from Alibaba)" },
        { num: "02", title: "Write a Modelfile", desc: "FROM qwen2.5:1.5b\\nSYSTEM \"You are Ahad-GPT...\"\\n(tells the model your name & personality)" },
        { num: "03", title: "Create Your Model", desc: "ollama create ahad-gpt -f Modelfile\\nNow it's a named model in your library" },
    ];
    steps.forEach((s, i) => {
        let cx = 0.5 + i * 3.3;
        // Number
        slide.addText(s.num, {
            x: cx, y: 1.0, w: 0.8, h: 0.5,
            fontSize: 36, color: colors.accent, bold: true, margin: 0,
        });
        // Title
        slide.addText(s.title, {
            x: cx, y: 1.6, w: 2.8, h: 0.35,
            fontSize: 14, color: colors.white, bold: true, margin: 0,
        });
        // Desc
        slide.addText(s.desc.replace(/\\n/g, "\n"), {
            x: cx, y: 2.0, w: 2.8, h: 1.8,
            fontSize: 12, color: colors.slate, margin: 0, lineSpacing: 16,
        });
        // Separator line
        if (i < 2) {
            slide.addShape(pres.shapes.LINE, {
                x: cx + 2.9, y: 1.8, w: 0.3, h: 0,
                line: { color: colors.divider, width: 1, dashType: "dash" },
            });
        }
    });
    // Key concept box
    slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y: 4.0, w: 9, h: 1.2,
        fill: { color: colors.bgLight },
        line: { color: colors.accentDim, width: 1 },
    });
    slide.addText("Key Concept: A \"Modelfile\" is NOT training. It is a config layer on top of existing weights. You didn't train 1.5B parameters — you applied a custom system prompt, which means the model's first instruction is to act as Ahad-GPT. For a university project, this is a valid, real-world customization pattern.", {
        x: 0.7, y: 4.1, w: 8.6, h: 1.0,
        fontSize: 12, color: colors.offWhite, margin: 0, lineSpacing: 16,
    });
}

// ── SLIDE 6: Real Modelfile ──
{
    let slide = pres.addSlide();
    slide.background = { color: colors.bg };
    addAccentBar(slide);
    slide.addText("The Actual Modelfile", {
        x: 0.5, y: 0.3, w: 9, h: 0.5,
        fontSize: 28, fontFace: "Arial", color: colors.accent, bold: true, margin: 0,
    });
    slide.addText("This is the file that makes it \"Ahad-GPT\":", {
        x: 0.5, y: 0.9, w: 9, h: 0.3,
        fontSize: 13, color: colors.slate, margin: 0,
    });
    // Code block area
    slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y: 1.3, w: 9, h: 3.8,
        fill: { color: "0A0E17" },
        line: { color: colors.divider, width: 1 },
    });
    const code = [
        "FROM qwen2.5:1.5b",
        "",
        'SYSTEM """',
        "You are Ahad-GPT, a custom university AI assistant built by Ahad.",
        "You are helpful, creative, and explain things with a student-friendly tone.",
        "You were created as part of a PHP + AI project to demonstrate how anyone",
        "can run their own ChatGPT-like interface using local open-source models.",
        "You are not GPT-4, but you are fast, private, and run entirely on the",
        "user's machine.",
        '"""',
        "",
        "PARAMETER temperature 0.7",
        "PARAMETER top_p 0.9",
    ];
    slide.addText(code.join("\n"), {
        x: 0.7, y: 1.45, w: 8.6, h: 3.5,
        fontSize: 12, color: colors.ice, margin: 0,
        fontFace: "Consolas",
        lineSpacing: 18,
    });
    // Side note
    slide.addShape(pres.shapes.OVAL, {
        x: 9.2, y: 1.5, w: 0.06, h: 0.06,
        fill: { color: colors.accent },
    });
    slide.addText("temperature 0.7 = creative but grounded\ntop_p 0.9 = focused sampling", {
        x: 9.5, y: 1.3, w: 2.5, h: 1.0,
        fontSize: 10, color: colors.slate, margin: 0, lineSpacing: 14,
    });
}

// ── SLIDE 7: How a Message Travels ──
{
    let slide = pres.addSlide();
    slide.background = { color: colors.bg };
    addAccentBar(slide);
    slide.addText("Data Flow: What Happens When You Chat", {
        x: 0.5, y: 0.3, w: 9, h: 0.5,
        fontSize: 28, fontFace: "Arial", color: colors.accent, bold: true, margin: 0,
    });
    // Flow steps vertically on left, detail on right
    const flow = [
        { step: "1", label: "User types in browser", detail: "DOM event captured by app.js", y: 1.3 },
        { step: "2", label: "POST to api.php", detail: "JSON payload with message + model ID", y: 2.0 },
        { step: "3", label: "PHP saves to SQLite", detail: "chat history in chats.db", y: 2.7 },
        { step: "4", label: "PHP calls Ollama", detail: "POST /api/chat with streaming=true", y: 3.4 },
        { step: "5", label: "Ollama generates response", detail: "runs Qwen2.5 + your system prompt", y: 4.1 },
        { step: "6", label: "Words stream back", detail: "each token arrives individually via chunked HTTP", y: 4.8 },
    ];
    flow.forEach(f => {
        // Number circle
        slide.addShape(pres.shapes.OVAL, {
            x: 0.5, y: f.y, w: 0.42, h: 0.42,
            fill: { color: colors.accentDim },
        });
        slide.addText(f.step, {
            x: 0.5, y: f.y, w: 0.42, h: 0.42,
            fontSize: 14, color: colors.white, bold: true,
            align: "center", valign: "middle", margin: 0,
        });
        // Labels
        slide.addText(f.label, {
            x: 1.1, y: f.y + 0.02, w: 3.0, h: 0.2,
            fontSize: 13, color: colors.white, bold: true, margin: 0,
        });
        slide.addText(f.detail, {
            x: 1.1, y: f.y + 0.28, w: 3.0, h: 0.2,
            fontSize: 11, color: colors.slate, margin: 0,
        });
    });
    // Right side "streaming" box
    slide.addShape(pres.shapes.RECTANGLE, {
        x: 5.0, y: 1.5, w: 4.2, h: 3.5,
        fill: { color: colors.bgLight },
        line: { color: colors.accentDim, width: 1 },
    });
    slide.addText("Live Streaming", {
        x: 5.2, y: 1.7, w: 3.8, h: 0.3,
        fontSize: 14, color: colors.accent, bold: true, margin: 0,
    });
    slide.addText("Like ChatGPT, each word appears as it is generated, not all at once. This is called Server-Sent Events (SSE) streaming.", {
        x: 5.2, y: 2.1, w: 3.8, h: 1.2,
        fontSize: 12, color: colors.slate, margin: 0, lineSpacing: 16,
    });
    // Simulated streaming text box
    slide.addShape(pres.shapes.RECTANGLE, {
        x: 5.2, y: 3.2, w: 3.8, h: 1.3,
        fill: { color: "0A0E17" },
        line: { color: colors.divider, width: 1 },
    });
    slide.addText('User: "Hello!"\nBot:  "Hello", "there", "I", "am", "Ahad-GPT", "!"',
        {
            x: 5.4, y: 3.35, w: 3.4, h: 1.0,
            fontSize: 11, color: colors.ice, margin: 0, lineSpacing: 16,
            fontFace: "Consolas",
        });
    slide.addText("Each word = one JSON chunk from Ollama", {
        x: 5.2, y: 4.7, w: 3.8, h: 0.2,
        fontSize: 10, color: colors.slate, margin: 0, align: "center",
    });
}

// ── SLIDE 8: Tech Stack ──
{
    let slide = pres.addSlide();
    slide.background = { color: colors.bg };
    addAccentBar(slide);
    slide.addText("Technology Stack", {
        x: 0.5, y: 0.3, w: 9, h: 0.5,
        fontSize: 28, fontFace: "Arial", color: colors.accent, bold: true, margin: 0,
    });
    // Grid of tech
    const techs = [
        { name: "Qwen2.5 1.5B", cat: "Base LLM", by: "Alibaba" },
        { name: "Ollama", cat: "Inference Engine", by: "Ollama Inc" },
        { name: "Ollama Modelfile", cat: "Customization", by: "You" },
        { name: "PHP 8", cat: "Backend API", by: "Core" },
        { name: "SQLite", cat: "Database", by: "Core" },
        { name: "cURL (PHP)", cat: "HTTP Client", by: "Core" },
        { name: "HTML5/CSS3", cat: "Frontend", by: "Web" },
        { name: "Vanilla JS", cat: "Frontend Logic", by: "ES6+" },
    ];
    const cols = 4;
    techs.forEach((t, i) => {
        let col = i % cols;
        let row = Math.floor(i / cols);
        let cx = 0.5 + col * 2.5;
        let cy = 1.2 + row * 2.0;
        slide.addShape(pres.shapes.RECTANGLE, {
            x: cx, y: cy, w: 2.2, h: 1.6,
            fill: { color: colors.bgLight },
            line: { color: colors.divider, width: 1 },
        });
        slide.addText(t.cat.toUpperCase(), {
            x: cx + 0.1, y: cy + 0.15, w: 2.0, h: 0.2,
            fontSize: 9, color: colors.accent, margin: 0, letterSpacing: 2,
        });
        slide.addText(t.name, {
            x: cx + 0.1, y: cy + 0.45, w: 2.0, h: 0.3,
            fontSize: 15, color: colors.white, bold: true, margin: 0,
        });
        slide.addText(t.by, {
            x: cx + 0.1, y: cy + 0.85, w: 2.0, h: 0.2,
            fontSize: 11, color: colors.slate, margin: 0,
        });
    });
}

// ── SLIDE 9: Why It's "Your Own Model" ──
{
    let slide = pres.addSlide();
    slide.background = { color: colors.bg };
    addAccentBar(slide);
    slide.addText('Is It Really \"My Own\" Model?', {
        x: 0.5, y: 0.3, w: 9, h: 0.5,
        fontSize: 28, fontFace: "Arial", color: colors.accent, bold: true, margin: 0,
    });
    // Two-column layout
    slide.addText("You DID NOT:", {
        x: 0.5, y: 1.1, w: 4.2, h: 0.3,
        fontSize: 14, color: colors.slate, bold: true, margin: 0,
    });
    const didNot = [
        "Train 1.5B parameters from scratch (would cost ~$50K+",
        "Copy GPT-4 or any proprietary code",
        "Just call someone else's API",
        "Claim it's your \"algorithm\"",
    ];
    didNot.forEach((text, i) => {
        slide.addText("\\u2717 " + text, {
            x: 0.5, y: 1.5 + i * 0.35, w: 4.2, h: 0.3,
            fontSize: 12, color: colors.slate, margin: 0,
        });
    });

    slide.addText("You DID:", {
        x: 5.4, y: 1.1, w: 4.2, h: 0.3,
        fontSize: 14, color: colors.accent, bold: true, margin: 0,
    });
    const did = [
        "Choose and deploy an open-source model (Qwen2.5)",
        "Apply a custom identity via Ollama's Modelfile",
        "Host it entirely on your own hardware",
        "Build a complete full-stack platform around it",
    ];
    did.forEach((text, i) => {
        slide.addText("\\u2713 " + text, {
            x: 5.4, y: 1.5 + i * 0.35, w: 4.2, h: 0.3,
            fontSize: 12, color: colors.accent, margin: 0,
        });
    });

    // Center quote box
    slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y: 3.3, w: 9, h: 1.4,
        fill: { color: colors.bgLight },
        line: { color: colors.accentDim, width: 1 },
    });
    slide.addText('"I did not build the car from scratch, but I tuned the engine, designed the body, built the dashboard, and I am driving it myself. That is what \"my own\" means in real-world systems."',
        {
            x: 0.7, y: 3.45, w: 8.6, h: 1.1,
            fontSize: 13, color: colors.offWhite, italic: true,
            align: "center", margin: 0, lineSpacing: 18,
        });
}

// ── SLIDE 10: Demo / Screenshots ──
{
    let slide = pres.addSlide();
    slide.background = { color: colors.bg };
    addAccentBar(slide);
    slide.addText("Live System Demo", {
        x: 0.5, y: 0.3, w: 9, h: 0.5,
        fontSize: 28, fontFace: "Arial", color: colors.accent, bold: true, margin: 0,
    });
    // 2 placeholder screens
    slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y: 1.2, w: 4.2, h: 3.5,
        fill: { color: colors.bgLight },
        line: { color: colors.divider, width: 1 },
    });
    slide.addText("Browser View\\n(index.html)", {
        x: 0.5, y: 2.5, w: 4.2, h: 1.0,
        fontSize: 16, color: colors.slate, align: "center", valign: "middle", margin: 0,
    });
    slide.addText("ChatGPT-like dark UI with sidebar chat history, streaming responses, and markdown rendering", {
        x: 0.5, y: 4.8, w: 4.2, h: 0.4,
        fontSize: 10, color: colors.slate, align: "center", margin: 0,
    });

    slide.addShape(pres.shapes.RECTANGLE, {
        x: 5.3, y: 1.2, w: 4.2, h: 3.5,
        fill: { color: colors.bgLight },
        line: { color: colors.divider, width: 1 },
    });
    slide.addText("Terminal View\\n(Ollama + API)", {
        x: 5.3, y: 2.5, w: 4.2, h: 1.0,
        fontSize: 16, color: colors.slate, align: "center", valign: "middle", margin: 0,
    });
    slide.addText("Ollama serves ahad-gpt on port 11434. PHP backend routes requests and maintains chat state.", {
        x: 5.3, y: 4.8, w: 4.2, h: 0.4,
        fontSize: 10, color: colors.slate, align: "center", margin: 0,
    });
}

// ── SLIDE 11: Future Improvements ──
{
    let slide = pres.addSlide();
    slide.background = { color: colors.bg };
    addAccentBar(slide);
    slide.addText("Future Roadmap", {
        x: 0.5, y: 0.3, w: 9, h: 0.5,
        fontSize: 28, fontFace: "Arial", color: colors.accent, bold: true, margin: 0,
    });
    const features = [
        { icon: "\\u2705", text: "Deploy to a public server (VPS / Raspberry Pi)" },
        { icon: "\\u2022", text: "Add multi-user authentication (JWT / session tokens)" },
        { icon: "\\u2022", text: "Swap in a larger model (Llama3.2-3B or Qwen3.5-7B)" },
        { icon: "\\u2022", text: "Train a LoRA adapter on your own data (real fine-tuning)" },
        { icon: "\\u2022", text: "Add RAG (upload PDFs, query documents)" },
        { icon: "\\u2022", text: "Export conversations as Markdown / PDF" },
    ];
    features.forEach((f, i) => {
        slide.addText(f.icon + "  " + f.text, {
            x: 0.7, y: 1.2 + i * 0.55, w: 9, h: 0.4,
            fontSize: 14, color: colors.offWhite, margin: 0,
        });
    });
}

// ── SLIDE 12: Thank You / Q&A ──
{
    let slide = pres.addSlide();
    slide.background = { color: colors.bg };
    // Top accent
    slide.addShape(pres.shapes.RECTANGLE, {
        x: 0, y: 0, w: 0.12, h: 5.625,
        fill: { color: colors.accent },
    });
    slide.addText("Thank You", {
        x: 0.8, y: 2.0, w: 8.5, h: 0.8,
        fontSize: 52, fontFace: "Arial Black", color: colors.white,
        bold: true, margin: 0,
    });
    slide.addText("Questions?", {
        x: 0.8, y: 2.9, w: 8.5, h: 0.5,
        fontSize: 24, color: colors.accent, margin: 0,
    });
    slide.addText("Project: ~/projects/university-chatgpt  |  Stack: Qwen + Ollama + PHP + SQLite + Vanilla JS", {
        x: 0.8, y: 4.3, w: 8.5, h: 0.3,
        fontSize: 12, color: colors.slate, margin: 0,
    });
}

// ── WRITE ──
pres.writeFile({ fileName: outputPath })
    .then(() => console.log("✅ Presentation created: " + outputPath))
    .catch(err => console.error("ERR:", err));
