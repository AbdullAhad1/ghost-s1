<?php
/**
 * Ahad-GPT API Backend
 * Proxies requests to local Ollama with streaming support
 */

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$action = $input["action"] ?? "";

// ── DB ──
$db = new PDO("sqlite:chats.db");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// ── ACTIONS ──
switch ($action) {

    case "chat":
        $chatId = $input["chat_id"] ?? null;
        $message = trim($input["message"] ?? "");
        $model = $input["model"] ?? "ghost-s1";

        if (!$message) {
            echo json_encode(["error" => "Empty message"]); exit;
        }

        // Create new chat if needed
        if (!$chatId) {
            $title = substr($message, 0, 40) . (strlen($message) > 40 ? "..." : "");
            $stmt = $db->prepare("INSERT INTO chats (title, model) VALUES (?, ?)");
            $stmt->execute([$title, $model]);
            $chatId = $db->lastInsertId();
        } else {
            // Verify chat exists
            $stmt = $db->prepare("SELECT model FROM chats WHERE id = ?");
            $stmt->execute([$chatId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) {
                echo json_encode(["error" => "Chat not found"]); exit;
            }
            if (empty($input["model"])) $model = $row["model"];
        }

        // Block chat if model is not loaded (powered off)
        $ollamaBin = trim(shell_exec('which ollama 2>/dev/null')) ?: '/usr/local/bin/ollama';
        $psOutput = shell_exec(escapeshellarg($ollamaBin) . ' ps 2>/dev/null');
        $modelRunning = $psOutput && strpos($psOutput, $model) !== false;
        if (!$modelRunning) {
            http_response_code(503);
            echo json_encode(["error" => "ghost-s1 is OFF. flip the power toggle to wake it up."]);
            exit;
        }

        // Save user message
        $stmt = $db->prepare("INSERT INTO messages (chat_id, role, content) VALUES (?, 'user', ?)");
        $stmt->execute([$chatId, $message]);

        $messages = [];

        // Fetch previous messages
        $stmt = $db->prepare("SELECT role, content FROM messages WHERE chat_id = ? ORDER BY id ASC");
        $stmt->execute([$chatId]);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $messages[] = ["role" => $row["role"], "content" => $row["content"]];
        }

        $payload = [
            "model" => $model,
            "messages" => $messages,
            "stream" => true,
            "options" => [
                "temperature"      => floatval($input["temperature"] ?? 0.4),
                "repeat_penalty"   => floatval($input["repeat_penalty"] ?? 1.3),
                "num_predict"      => intval($input["max_tokens"] ?? 50),
                "top_p"            => floatval($input["top_p"] ?? 0.8),
                "top_k"            => intval($input["top_k"] ?? 20),
                "frequency_penalty"=> floatval($input["frequency_penalty"] ?? 0.0),
                "presence_penalty" => floatval($input["presence_penalty"] ?? 0.0)
            ]
        ];

        // Stream response from Ollama
        $ch = curl_init("http://localhost:11434/api/chat");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);

        ob_start();
        $fullResponse = "";
        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($curl, $data) use (&$fullResponse) {
            echo $data;
            $lines = explode("\n", $data);
            foreach ($lines as $line) {
                $line = trim($line);
                if (!$line) continue;
                $json = json_decode($line, true);
                if (isset($json["message"]["content"])) {
                    $fullResponse .= $json["message"]["content"];
                }
            }
            ob_flush();
            flush();
            return strlen($data);
        });

        header("Content-Type: application/x-ndjson");
        flush();

        curl_exec($ch);
        curl_close($ch);

        // Save assistant response
        if ($fullResponse) {
            $stmt = $db->prepare("INSERT INTO messages (chat_id, role, content) VALUES (?, 'assistant', ?)");
            $stmt->execute([$chatId, $fullResponse]);
        }

        // Return chat_id
        echo "\n" . json_encode(["chat_id" => (int)$chatId, "done" => true]);
        exit;

    case "list_chats":
        $stmt = $db->query("SELECT id, title, model, created_at FROM chats ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;

    case "load_chat":
        $chatId = $input["chat_id"] ?? 0;
        $stmt = $db->prepare("SELECT id, title, model FROM chats WHERE id = ?");
        $stmt->execute([$chatId]);
        $chat = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$chat) {
            echo json_encode(["error" => "Chat not found"]);
            exit;
        }
        $stmt = $db->prepare("SELECT role, content, created_at FROM messages WHERE chat_id = ? ORDER BY id ASC");
        $stmt->execute([$chatId]);
        $chat["messages"] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($chat);
        exit;

    case "delete_chat":
        $chatId = $input["chat_id"] ?? 0;
        $db->prepare("DELETE FROM messages WHERE chat_id = ?")->execute([$chatId]);
        $db->prepare("DELETE FROM chats WHERE id = ?")->execute([$chatId]);
        echo json_encode(["success" => true]);
        exit;

    case "list_models":
        $ollamaBin = trim(shell_exec('which ollama 2>/dev/null') ?: '') ?: 'ollama';
        $listOutput = shell_exec($ollamaBin . ' list 2>/dev/null');
        $models = [];
        if ($listOutput) {
            $lines = explode("\n", trim($listOutput));
            foreach ($lines as $line) {
                if (strpos($line, 'NAME') === 0 || trim($line) === '') continue;
                $parts = preg_split('/\s+/', trim($line));
                $name = $parts[0] ?? '';
                if (!$name) continue;
                $label = ($name === 'ghost-s1') ? 'GHOST S1 (Custom)' : strtoupper($name);
                $models[] = ["name" => $name, "label" => $label, "custom" => ($name === 'ghost-s1')];
            }
        }
        if (empty($models)) {
            $models = [["name" => "ghost-s1", "label" => "GHOST S1 (Custom)", "custom" => true]];
        }
        echo json_encode($models);
        exit;

    case "rename_chat":
        $chatId = $input["chat_id"] ?? 0;
        $title = trim($input["title"] ?? "");
        if ($title) {
            $db->prepare("UPDATE chats SET title = ? WHERE id = ?")->execute([$title, $chatId]);
        }
        echo json_encode(["success" => true]);
        exit;

    case "system_status":
        // CPU load average (1 min, normalized to ~% of single core)
        $load = sys_getloadavg();
        $cpu = min(100, round($load[0] * 100 / 8));

        // Memory usage
        $memPercent = 0;
        if (PHP_OS_FAMILY === 'Darwin') {
            $vm = shell_exec('vm_stat 2>/dev/null');
            $pageSize = ($vm && preg_match('/page size of (\d+) bytes/', $vm, $ps)) ? (int)$ps[1] : 16384;

            preg_match('/Pages free:\s+(\d+)/', $vm, $freeM);
            preg_match('/Pages active:\s+(\d+)/', $vm, $activeM);
            preg_match('/Pages inactive:\s+(\d+)/', $vm, $inactiveM);
            preg_match('/Pages speculative:\s+(\d+)/', $vm, $specM);
            preg_match('/Pages wired down:\s+(\d+)/', $vm, $wiredM);
            preg_match('/Pages occupied by compressor:\s+(\d+)/', $vm, $compM);

            $free     = (int)($freeM[1] ?? 0);
            $active   = (int)($activeM[1] ?? 0);
            $inactive = (int)($inactiveM[1] ?? 0);
            $spec     = (int)($specM[1] ?? 0);
            $wired    = (int)($wiredM[1] ?? 0);
            $comp     = (int)($compM[1] ?? 0);

            $totalPages = $free + $active + $inactive + $spec + $wired;
            // Active + Wired + Compressed (compressor pages are still used memory, stored compressed)
            $usedPages  = $active + $wired + $comp;

            $memPercent = $totalPages > 0 ? min(100, round($usedPages / $totalPages * 100)) : 0;
        } else {
            $memInfo = @file_get_contents('/proc/meminfo');
            if ($memInfo && preg_match('/MemTotal:\s+(\d+)\s+kB/', $memInfo, $total) && preg_match('/MemAvailable:\s+(\d+)\s+kB/', $memInfo, $avail)) {
                $memPercent = round((1 - ($avail[1] / $total[1])) * 100);
            }
        }

        echo json_encode([
            "sys" => "READY",
            "cpu" => $cpu,
            "mem" => $memPercent,
            "model" => "ghost-s1"
        ]);
        exit;

    case "model_power":
        $state = $input["state"] ?? "";
        $modelName = $input["model"] ?? "ghost-s1";
        $ollamaBin = trim(shell_exec("which ollama 2>/dev/null")) ?: "/usr/local/bin/ollama";

        if ($state === "off") {
            exec("$ollamaBin stop $modelName 2>&1", $out, $code);
            echo json_encode(["status" => "off", "message" => "model stopped", "output" => $out]);
        } elseif ($state === "on") {
            // Warm up — pulls model into memory
            $payload = json_encode(["model" => $modelName, "messages" => [["role" => "user", "content" => "ping"]]]);
            $ch = curl_init("http://localhost:11434/api/chat");
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_exec($ch);
            curl_close($ch);
            echo json_encode(["status" => "on", "message" => "model warmed up"]);
        } else {
            // Current status
            exec("$ollamaBin ps 2>&1", $out);
            $running = false;
            foreach ($out as $line) {
                if (strpos($line, $modelName) !== false) { $running = true; break; }
            }
            echo json_encode(["status" => $running ? "on" : "off"]);
        }
        exit;

    default:
        echo json_encode(["error" => "Unknown action: $action"]);
        exit;
}
