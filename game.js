// Текущий выигранный предмет
let currentWonPrize = null;

// Создание секторов на колесе
function createWheelSectors() {
    const wheel = document.getElementById('wheel');
    if (!wheel) return;
    
    wheel.innerHTML = '';
    
    // Берем 8 случайных призов для отображения на колесе
    const displayPrizes = [...ALL_PRIZES]
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);
    
    const angle = 360 / displayPrizes.length;
    
    displayPrizes.forEach((prize, index) => {
        const sector = document.createElement('div');
        sector.className = 'wheel-item';
        sector.style.transform = `rotate(${index * angle}deg)`;
        sector.innerHTML = prize.icon;
        sector.title = prize.name;
        sector.style.color = prize.color;
        
        wheel.appendChild(sector);
    });
}

// Отображение призов в сетке
function displayPrizesGrid() {
    const grid = document.getElementById('prizesGrid');
    if (!grid) return;
    
    // Показываем 6 случайных призов
    const randomPrizes = [...ALL_PRIZES]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
    
    grid.innerHTML = randomPrizes.map(prize => `
        <div class="prize-item" style="border-color: ${prize.color}">
            <div class="prize-icon">${prize.icon}</div>
            <div class="prize-name">${prize.name}</div>
            <div class="prize-value">${prize.sellPrice} ★</div>
        </div>
    `).join('');
}

// Вращение колеса
function spinWheel() {
    if (playerData.stars < 50) {
        showNotification('Недостаточно звезд! Минимум 50 ★');
        return;
    }
    
    // Спин стоит 50 звезд
    playerData.stars -= 50;
    playerData.totalSpins++;
    
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spinButton');
    
    // Блокируем кнопку на время вращения
    spinButton.disabled = true;
    spinButton.innerHTML = '🌀 ВРАЩАЕТСЯ...';
    
    // Случайное количество оборотов (3-8 полных оборотов + случайный приз)
    const spins = 3 + Math.floor(Math.random() * 6);
    const prizeIndex = Math.floor(Math.random() * ALL_PRIZES.length);
    const sectorAngle = 360 / 8; // У нас 8 секторов
    const targetAngle = spins * 360 + (prizeIndex % 8) * sectorAngle;
    
    // Анимация вращения
    wheel.style.transition = 'transform 3s cubic-bezier(0.2, 0.8, 0.3, 1)';
    wheel.style.transform = `rotate(${targetAngle}deg)`;
    
    // Получаем случайный приз (по шансам, а не по сектору)
    currentWonPrize = getRandomPrize();
    
    // Сохраняем игру
    saveGameData();
    updateUI();
    
    // Показываем результат через 3 секунды
    setTimeout(() => {
        showResult(currentWonPrize);
        spinButton.disabled = false;
        spinButton.innerHTML = '🎡 КРУТИТЬ';
    }, 3000);
}

// Показать результат
function showResult(prize) {
    const modal = document.getElementById('resultModal');
    const icon = document.getElementById('resultIcon');
    const title = document.getElementById('resultTitle');
    const description = document.getElementById('resultDescription');
    const sellPrice = document.getElementById('sellPrice');
    
    if (!modal || !icon || !title) return;
    
    // Заполняем данные
    icon.textContent = prize.icon;
    icon.style.color = prize.color;
    title.textContent = '🎉 ВЫ ВЫИГРАЛИ!';
    description.textContent = prize.description;
    sellPrice.textContent = prize.sellPrice;
    
    // Показываем модальное окно
    modal.style.display = 'flex';
}

// Закрыть результат
function closeResult() {
    const modal = document.getElementById('resultModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Добавить в инвентарь
function addToInventory() {
    if (!currentWonPrize) return;
    
    // Проверяем тип приза
    if (currentWonPrize.type === 'stars') {
        playerData.stars += currentWonPrize.sellPrice;
        showNotification(`🎉 Вы получили ${currentWonPrize.sellPrice} звезд!`);
    } else if (currentWonPrize.type === 'free_spin') {
        playerData.stars += 50; // Эквивалент бесплатного спина
        showNotification('🔄 Получен бесплатный спин!');
    } else {
        // Добавляем NFT в инвентарь
        if (!playerData.inventory) {
            playerData.inventory = [];
        }
        
        // Добавляем уникальный ID и дату
        const inventoryItem = {
            ...currentWonPrize,
            inventoryId: Date.now(),
            wonDate: new Date().toLocaleString('ru-RU')
        };
        
        playerData.inventory.push(inventoryItem);
        playerData.wonItems++;
        
        showNotification(`🎁 "${currentWonPrize.name}" добавлен в инвентарь!`);
    }
    
    // Сохраняем и обновляем
    saveGameData();
    updateUI();
    closeResult();
    currentWonPrize = null;
}

// Продать сразу (из модалки)
function sellPrize() {
    if (!currentWonPrize) return;
    
    playerData.stars += currentWonPrize.sellPrice;
    showNotification(`💰 Продано за ${currentWonPrize.sellPrice} звезд!`);
    
    saveGameData();
    updateUI();
    closeResult();
    currentWonPrize = null;
}

// Показать уведомление
function showNotification(message) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Автоматически скрыть через 3 секунды
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Назначаем обработчик для кнопки продажи
    const sellButton = document.querySelector('.result-button.secondary');
    if (sellButton) {
        sellButton.addEventListener('click', sellPrize);
    }
    
    // Загружаем данные
    loadGameData();
});
