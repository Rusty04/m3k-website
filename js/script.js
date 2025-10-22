// ===== ОСНОВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ =====
// Запускается когда вся страница полностью загружена
document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт M3K загружен! Инициализация компонентов...');
    
    initLazyLoading();      // Ленивая загрузка изображений для ускорения сайта
    initGallery();          // Галерея с фильтрами по категориям
    initScrollAnimations(); // Анимации появления элементов при скролле
    initFileUpload();       // Красивая загрузка файлов с Drag&Drop
    
    // Обработка формы заявки на странице контактов
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', handleFormSubmit);
    }
});

// ===== ЛЕНИВАЯ ЗАГРУЗКА ИЗОБРАЖЕНИЙ =====
// Загружает изображения только когда они появляются в области видимости
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    // Проверяем поддержку современного API Intersection Observer
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    // Загружаем изображение когда оно появляется в viewport
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img); // Прекращаем наблюдение за загруженным изображением
                }
            });
        });

        // Начинаем наблюдение за всеми ленивыми изображениями
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback для старых браузеров - загружаем все сразу
        lazyImages.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    }
}

// ===== ГАЛЕРЕЯ С ФИЛЬТРАМИ =====
// Позволяет фильтровать работы по категориям (школы, детсады, офисы)
function initGallery() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Обновляем активную кнопку фильтра
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Фильтруем элементы галереи в зависимости от выбранной категории
            galleryItems.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// ===== АНИМАЦИИ ПРИ ПОЯВЛЕНИИ ЭЛЕМЕНТОВ =====
// Плавное появление элементов когда они попадают в область видимости
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 }); // Срабатывает когда 10% элемента видно
    
    // Начинаем наблюдение за всеми элементами с анимацией
    fadeElements.forEach(el => observer.observe(el));
}

// ===== КРАСИВАЯ ЗАГРУЗКА ФАЙЛОВ С DRAG&DROP =====
// Заменяет стандартную кнопку выбора файлов на красивую область
function initFileUpload() {
    const fileUploads = document.querySelectorAll('.file-upload');
    
    fileUploads.forEach(container => {
        const input = container.querySelector('input[type="file"]');
        
        // Обработка клика по области загрузки - открываем диалог выбора файлов
        container.addEventListener('click', (e) => {
            // Предотвращаем всплытие события, если кликнули на кнопку удаления
            if (!e.target.classList.contains('remove-file')) {
                input.click();
            }
        });
        
        // Drag & Drop функциональность - подсветка при перетаскивании
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('dragover');
        });
        
        container.addEventListener('dragleave', () => {
            container.classList.remove('dragover');
        });
        
        // Обработка отпускания файлов в области
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('dragover');
            input.files = e.dataTransfer.files;
            handleFileUpload({ target: input });
        });

        // Обработка изменения выбранных файлов через стандартный диалог
        input.addEventListener('change', handleFileUpload);
    });
}

// ===== ОБРАБОТКА ВЫБРАННЫХ ФАЙЛОВ =====
// Обновляет интерфейс после выбора файлов пользователем
function handleFileUpload(event) {
    const input = event.target;
    const container = input.closest('.file-upload');
    const fileName = container.querySelector('.file-name');
    
    if (input.files.length > 0) {
        // Добавляем класс для визуального обозначения выбранных файлов
        container.classList.add('has-file');
        
        // Показываем информацию о выбранных файлах
        if (input.files.length === 1) {
            fileName.innerHTML = `Выбран файл: ${input.files[0].name} <button type="button" class="remove-file" onclick="removeFile(this)">×</button>`;
        } else {
            fileName.innerHTML = `Выбрано файлов: ${input.files.length} <button type="button" class="remove-file" onclick="removeFile(this)">×</button>`;
        }
    } else {
        // Возвращаем к исходному состоянию если файлов нет
        container.classList.remove('has-file');
        fileName.innerHTML = 'Перетащите файлы сюда или нажмите для выбора';
    }
}

// ===== УДАЛЕНИЕ ВЫБРАННЫХ ФАЙЛОВ =====
// Позволяет пользователю очистить выбор файлов
function removeFile(button) {
    const container = button.closest('.file-upload');
    const input = container.querySelector('input[type="file"]');
    const fileName = container.querySelector('.file-name');
    
    // Сбрасываем значение input file
    input.value = '';
    
    // Обновляем отображение - возвращаем к исходному состоянию
    container.classList.remove('has-file');
    fileName.innerHTML = 'Перетащите файлы сюда или нажмите для выбора';
    
    // Предотвращаем всплытие события чтобы не открывался диалог выбора файлов
    event.stopPropagation();
}

// ===== ВРЕМЕННАЯ ФУНКЦИЯ ДЛЯ ТЕСТИРОВАНИЯ ФОРМ =====
// На реальном хостинге замените на версию с Telegram
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Собираем данные формы для отображения
    const formDataObj = {};
    for (let [key, value] of formData.entries()) {
        formDataObj[key] = value;
    }
    
    console.log('Данные формы:', formDataObj);
    
    // Показываем индикатор загрузки
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading-spinner">⏳</span> Отправка...';
    submitBtn.disabled = true;
    
    // Имитируем задержку отправки
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Показываем данные формы в alert для тестирования
    let message = "ТЕСТОВАЯ ОТПРАВКА (на сервере будет Telegram):\n\n";
    message += `Имя: ${formDataObj.name || 'Не указано'}\n`;
    message += `Телефон: ${formDataObj.phone || 'Не указан'}\n`;
    message += `Email: ${formDataObj.email || 'Не указан'}\n`;
    message += `Услуга: ${formDataObj.service || 'Не выбрана'}\n`;
    message += `Сообщение: ${formDataObj.message || 'Не указано'}\n\n`;
    message += "✅ На реальном хостинге это сообщение придет в Telegram всем менеджерам!";
    
    alert(message);
    
    // Сбрасываем форму
    form.reset();
    resetFileUploads(form);
    
    // Восстанавливаем кнопку
    submitBtn.textContent = 'Отправить заявку';
    submitBtn.disabled = false;
}

// ===== ФУНКЦИЯ ДЛЯ РЕАЛЬНОГО ХОСТИНГА (РАСКОММЕНТИРОВАТЬ ПОСЛЕ ЗАГРУЗКИ) =====
/*
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    try {
        // Показываем индикатор загрузки
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading-spinner">⏳</span> Отправка...';
        submitBtn.disabled = true;
        
        // Отправляем данные на сервер для Telegram уведомлений
        const response = await fetch('telegram-bot.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Успешная отправка
            alert('✅ Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
            form.reset();
            resetFileUploads(form);
            
            // Яндекс.Метрика - цель "Отправка формы"
            if (typeof ym !== 'undefined') {
                ym(00000000, 'reachGoal', 'form_submit');
            }
            
        } else {
            throw new Error('Ошибка отправки на сервере');
        }
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Произошла ошибка при отправке. Пожалуйста, позвоните нам напрямую.');
    } finally {
        // Восстанавливаем кнопку
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Отправить заявку';
        submitBtn.disabled = false;
    }
}
*/

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
// Сброс полей загрузки файлов
function resetFileUploads(form) {
    const fileUploads = form.querySelectorAll('.file-upload');
    fileUploads.forEach(container => {
        const fileName = container.querySelector('.file-name');
        fileName.innerHTML = 'Перетащите файлы сюда или нажмите для выбора';
        container.classList.remove('has-file');
    });
}