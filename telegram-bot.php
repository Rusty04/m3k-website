<?php
// telegram-bot.php

// Загружаем конфиг
$config = require 'config.php';
$botToken = $config['telegram']['bot_token'];
$chatIds = $config['telegram']['chat_ids'];

header('Content-Type: application/json');

// Настройки CORS для безопасности
$allowed_origins = ['https://m3k.ru', 'https://www.m3k.ru'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Получаем данные формы
    $name = htmlspecialchars($_POST['name'] ?? 'Не указано');
    $phone = htmlspecialchars($_POST['phone'] ?? 'Не указан');
    $email = htmlspecialchars($_POST['email'] ?? 'Не указан');
    $service = htmlspecialchars($_POST['service'] ?? 'Не выбрана');
    $message = htmlspecialchars($_POST['message'] ?? 'Не указано');
    
    // 🔐 НАСТРОЙТЕ ЭТИ ДАННЫЕ ПЕРЕД ИСПОЛЬЗОВАНИЕМ
    $botToken = $config['telegram']['bot_token']; // Замените на токен от @BotFather
    $chatIds = [                 // Замените на реальные chat_id
        '1020896433',    // Менеджер 1
        '987654321',    // Менеджер 2
    ];
    
    // Формируем сообщение для Telegram
    $telegramMessage = "🛠 *НОВАЯ ЗАЯВКА M3K*\n\n";
    $telegramMessage .= "👤 *Имя:* $name\n";
    $telegramMessage .= "📞 *Телефон:* `$phone`\n";
    
    if ($email !== 'Не указан') {
        $telegramMessage .= "📧 *Email:* $email\n";
    }
    
    if ($service !== 'Не выбрана') {
        $telegramMessage .= "🛠 *Услуга:* $service\n";
    }
    
    $telegramMessage .= "💬 *Сообщение:* $message\n\n";
    $telegramMessage .= "⏰ *Время:* " . date('d.m.Y H:i:s') . "\n";
    $telegramMessage .= "🌐 *Источник:* сайт M3K";
    
    // Отправляем уведомления всем сотрудникам
    $successCount = 0;
    foreach ($chatIds as $chatId) {
        if (sendTelegramMessage($botToken, $chatId, $telegramMessage)) {
            $successCount++;
        }
    }
    
    // Логируем заявку (опционально)
    file_put_contents('telegram_log.txt', 
        date('Y-m-d H:i:s') . " | $name | $phone | $service\n", 
        FILE_APPEND | LOCK_EX
    );
    
    // Возвращаем результат
    echo json_encode([
        'success' => $successCount > 0,
        'sent_to' => $successCount,
        'message' => 'Заявка обработана'
    ]);
    exit;
}

/**
 * Отправляет сообщение в Telegram
 */
function sendTelegramMessage($botToken, $chatId, $message) {
    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
    
    $postData = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];
    
    $options = [
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => http_build_query($postData),
            'timeout' => 10
        ]
    ];
    
    $context = stream_context_create($options);
    
    try {
        $result = file_get_contents($url, false, $context);
        return $result !== false;
    } catch (Exception $e) {
        error_log("Telegram error: " . $e->getMessage());
        return false;
    }
}
?>