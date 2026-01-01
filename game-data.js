// Баланс и данные игрока
let playerData = {
    stars: 150,
    inventory: [],
    totalSpins: 0,
    wonItems: 0
};

// NFT-подарки для рулетки
const NFT_GIFTS = [
    // Обычные (50% шанс) - цена продажи 10-30 звезд
    {
        id: 1,
        icon: "🎁",
        name: "Стандартный бокс",
        description: "Обычный подарочный бокс",
        rarity: "common",
        sellPrice: 15,
        chance: 30,
        color: "#B0B0B0"
    },
    {
        id: 2,
        icon: "📦",
        name: "Тайная коробка",
        description: "Что же внутри?",
        rarity: "common",
        sellPrice: 20,
        chance: 25,
        color: "#808080"
    },
    {
        id: 3,
        icon: "🎀",
        name: "Подарок с бантом",
        description: "Аккуратно упакованный сюрприз",
        rarity: "common",
        sellPrice: 25,
        chance: 20,
        color: "#E6B0AA"
    },
    
    // Редкие (30% шанс) - цена продажи 40-80 звезд
    {
        id: 4,
        icon: "💎",
        name: "Бриллиантовый NFT",
        description: "Сияющий драгоценный камень",
        rarity: "rare",
        sellPrice: 50,
        chance: 15,
        color: "#4DABF7"
    },
    {
        id: 5,
        icon: "👑",
        name: "Цифровая корона",
        description: "Королевский головной убор",
        rarity: "rare",
        sellPrice: 70,
        chance: 10,
        color: "#FFD700"
    },
    {
        id: 6,
        icon: "🚀",
        name: "Космический корабль",
        description: "NFT для межгалактических путешествий",
        rarity: "rare",
        sellPrice: 65,
        chance: 12,
        color: "#9B59B6"
    },
    
    // Эпические (15% шанс) - цена продажи 100-200 звезд
    {
        id: 7,
        icon: "🐉",
        name: "Драконий яйцо",
        description: "Редкий драконий NFT",
        rarity: "epic",
        sellPrice: 150,
        chance: 8,
        color: "#E74C3C"
    },
    {
        id: 8,
        icon: "🌌",
        name: "Галактический артефакт",
        description: "Древний космический предмет",
        rarity: "epic",
        sellPrice: 180,
        chance: 5,
        color: "#3498DB"
    },
    
    // Легендарные (5% шанс) - цена продажи 300-500 звезд
    {
        id: 9,
        icon: "⭐",
        name: "Звезда удачи",
        description: "Мифический предмет, приносящий удачу",
        rarity: "legendary",
        sellPrice: 400,
        chance: 3,
        color: "#F1C40F"
    },
    {
        id: 10,
        icon: "🏆",
        name: "Кубок чемпиона",
        description: "Эксклюзивный трофей",
        rarity: "legendary",
        sellPrice: 500,
        chance: 2,
        color: "#E67E22"
    }
];

// Дополнительные призы (звезды, бесплатные вращения)
const BONUS_PRIZES = [
    {
        id: 11,
        icon: "★",
        name: "50 звезд",
        description: "Бонусные звезды",
        rarity: "bonus",
        sellPrice: 50,
        chance: 10,
        color: "#FFD700",
        type: "stars"
    },
    {
        id: 12,
        icon: "🔄",
        name: "Бесплатный спин",
        description: "Крутите рулетку бесплатно!",
        rarity: "bonus",
        sellPrice: 0,
        chance: 5,
        color: "#2ECC71",
        type: "free_spin"
    }
];

// Все возможные призы
const ALL_PRIZES = [...NFT_GIFTS, ...BONUS_PRIZES];

// Функция для получения случайного приза с учетом шансов
function getRandomPrize() {
    let totalChance = 0;
    ALL_PRIZES.forEach(prize => {
        totalChance += prize.chance;
    });
    
    let random = Math.random() * totalChance;
    let currentChance = 0;
    
    for (let prize of ALL_PRIZES) {
        currentChance += prize.chance;
        if (random <= currentChance) {
            return { ...prize, wonDate: new Date().toISOString() };
        }
    }
    
    // Если что-то пошло не так, возвращаем обычный приз
    return { ...NFT_GIFTS[0], wonDate: new Date().toISOString() };
}

// Функция для расчета цвета по редкости
function getRarityColor(rarity) {
    switch(rarity) {
        case 'common': return '#B0B0B0';
        case 'rare': return '#4DABF7';
        case 'epic': return '#DA77F2';
        case 'legendary': return '#FFD700';
        case 'bonus': return '#2ECC71';
        default: return '#FFFFFF';
    }
}

// Функция для сохранения данных игры
function saveGameData() {
    localStorage.setItem('rollStarsData', JSON.stringify(playerData));
}

// Функция для загрузки данных игры
function loadGameData() {
    const saved = localStorage.getItem('rollStarsData');
    if (saved) {
        playerData = JSON.parse(saved);
    }
    updateUI();
}

// Функция для обновления интерфейса
function updateUI() {
    // Обновляем счетчик звезд
    const starsElement = document.getElementById('starsCount');
    if (starsElement) {
        starsElement.textContent = playerData.stars;
    }
    
    // Обновляем счетчик инвентаря
    const invCountElement = document.getElementById('inventoryCount');
    if (invCountElement) {
        invCountElement.textContent = playerData.inventory ? playerData.inventory.length : 0;
    }
    
    // Обновляем кнопку вращения
    const spinButton = document.getElementById('spinButton');
    if (spinButton) {
        spinButton.disabled = playerData.stars < 50;
        if (playerData.stars < 50) {
            spinButton.innerHTML = '❌ НЕДОСТАТОЧНО ЗВЕЗД';
        }
    }
}

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    loadGameData();
    
    // Создаем сектора на колесе
    createWheelSectors();
    
    // Показываем призы в сетке
    displayPrizesGrid();
});
