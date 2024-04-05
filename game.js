(function () {                   // Початок самовикликаючої функції

    let isPause = false;         // Змінна, що відповідає за паузу
    let animationId = null;      // Змінна для зберігання id анімації

    let speed = 3;               // Швидкість гри
    let score = 0;               // Очки гравця
    let highScore = localStorage.getItem('highScore') || 0;  // Найкращий результат, збережений в локальному сховищі або 0

    const car = document.querySelector('.car');      // Елемент машинки гравця
    const carInfo = {            // Інформація про машинку гравця
        ...createElementInfo(car), // Данні про машинку
        move: {
            top: null,
            bottom: null,
            left: null,
            right: null,
        },
    };

    // Елементи гри
    const coin = document.querySelector('.coin');
    const coinInfo = createElementInfo(coin);

    const danger = document.querySelector('.danger');
    const dangerInfo = createElementInfo(danger);

    const arrow = document.querySelector('.arrow');

    const road = document.querySelector('.road');    // Дорога
    const roadHeight = road.clientHeight;           // Висота дороги
    const roadWidth = road.clientWidth / 2;         // Половина ширини дороги

    const gameButton = document.querySelector('.game-button');  // Кнопка "Play"
    const gameScore = document.querySelector('.game-score');    // Відображення рахунку гравця
    const backdrop = document.querySelector('.backdrop');       // Задній план
    const restartButton = document.querySelector('.restart-button');  // Кнопка "Restart"

    const highScoreElement = document.querySelector('.high-score');  // Відображення найкращого рахунку

    const trees = document.querySelectorAll('.tree');   // Масив дерев
    const treesCoords = [];                              // Масив координат дерев

    for (let i = 0; i < trees.length; i++) {
        const tree = trees[i];
        const coordsTree = getCoords(tree);

        treesCoords.push(coordsTree);                    // Додаємо координати дерева у масив
    }

    highScoreElement.innerText = highScore;              // Встановлюємо відображенням найкращого рахунку початкове значення

    document.addEventListener('keydown', (event) => {   // Обробник подій для натискання клавіш
        if (isPause) {
            return;                                     // Якщо гра на паузі, вийти з обробника
        }

        const code = event.code;

        // Обробка натискання клавіш руху (WASD)
        if (code === 'ArrowUp' && carInfo.move.top === null) {
            if (carInfo.move.bottom) {
                return;
            }
            carInfo.move.top = requestAnimationFrame(carMoveToTop);
            const carSound = document.getElementById('gas');
            carSound.play();                            // Відтворення звуку газу
        }
        else if (code === 'ArrowDown' && carInfo.move.bottom === null) {
            if (carInfo.move.top) {
                return;
            }
            carInfo.move.bottom = requestAnimationFrame(carMoveToBottom);
            const brakeSound = document.getElementById('brakeSound');
            brakeSound.play();                          // Відтворення звуку гальм
        }
        else if (code === 'ArrowLeft' && carInfo.move.left === null) {
            if (carInfo.move.right) {
                return;
            }
            carInfo.move.left = requestAnimationFrame(carMoveToLeft);
        }
        else if (code === 'ArrowRight' && carInfo.move.right === null) {
            if (carInfo.move.left) {
                return;
            }
            carInfo.move.right = requestAnimationFrame(carMoveToRight);
        }
    });

    document.addEventListener('keyup', (event) => {     // Обробник подій для відпускання клавіш
        const code = event.code;

        // Обробка відпускання клавіш руху (WASD)
        if (code === 'ArrowUp') {
            cancelAnimationFrame(carInfo.move.top);
            carInfo.move.top = null;
            const carSound = document.getElementById('gas');
            carSound.pause();                            // Припинення відтворення звуку газу
            carSound.currentTime = 0;                   // Перемотування звуку газу на початок
        }
        else if (code === 'ArrowDown') {
            cancelAnimationFrame(carInfo.move.bottom);
            carInfo.move.bottom = null;
            const brakeSound = document.getElementById('brakeSound');
            brakeSound.pause();                         // Припинення відтворення звуку гальм
            brakeSound.currentTime = 0;                // Перемотування звуку гальм на початок
        }
        else if (code === 'ArrowLeft') {
            cancelAnimationFrame(carInfo.move.left);
            carInfo.move.left = null;
        }
        else if (code === 'ArrowRight') {
            cancelAnimationFrame(carInfo.move.right);
            carInfo.move.right = null;
        }
    });

    function createElementInfo(element) {          // Функція для створення об'єкту з інформацією про елемент
        return {
            coords: getCoords(element),            // Отримання координат елемента
            height: element.clientHeight,          // Висота елемента
            width: element.clientWidth / 2,        // Половина ширини елемента
            visible: true,                         // Прапорець видимості елемента
        };
    }

    // Функції руху машинки гравця
    function carMoveToTop() {
        const newY = carInfo.coords.y - 5;

        if (newY < 0) {
            return;
        }

        carInfo.coords.y = newY;
        carMove(carInfo.coords.x, newY);
        carInfo.move.top = requestAnimationFrame(carMoveToTop);
    }
    function carMoveToBottom() {
        const newY = carInfo.coords.y + 5;

        if ((newY + carInfo.height) > roadHeight) {
            return;
        }

        carInfo.coords.y = newY;
        carMove(carInfo.coords.x, newY);
        carInfo.move.bottom = requestAnimationFrame(carMoveToBottom);
    }
    function carMoveToLeft() {
        const newX = carInfo.coords.x - 5;

        if (newX < -roadWidth + carInfo.width) {
            return;
        }

        carInfo.coords.x = newX;
        carMove(newX, carInfo.coords.y);
        carInfo.move.left = requestAnimationFrame(carMoveToLeft);
    }
    function carMoveToRight() {
        const newX = carInfo.coords.x + 5;

        if (newX > roadWidth - carInfo.width) {
            return;
        }

        carInfo.coords.x = newX;
        carMove(newX, carInfo.coords.y);
        carInfo.move.right = requestAnimationFrame(carMoveToRight);
    }

    function carMove(x, y) {                      // Функція руху машинки гравця
        car.style.transform = `translate(${x}px, ${y}px)`;
    }

    animationId = requestAnimationFrame(startGame);  // Запускаємо гру через анімацію

    function startGame() {                         // Логіка гри
        elementAnimation(danger, dangerInfo, -250);  // Анімація ворожих елементів

        if (hasCollision(carInfo, dangerInfo)) {    // Перевірка на зіткнення з ворожим елементом
            return finishGame();                    // Завершення гри
        }

        treesAnimation();                          // Анімація дерев
        elementAnimation(coin, coinInfo, -100);     // Анімація монетки

        if (coinInfo.visible && hasCollision(carInfo, coinInfo)) {  // Перевірка на зіткнення з монеткою
            score++;                                // Збільшення рахунку
            gameScore.innerText = score;            // Оновлення відображення рахунку
            coin.style.display = 'none';            // Приховання монетки
            coinInfo.visible = false;               // Зміна прапорця видимості монетки

            const coinSound = document.getElementById('coinSound');
            coinSound.play();                       // Відтворення звуку монетки

            const carSound = document.getElementById('carSound');
            carSound.play();                        // Відтворення звуку автомобіля

            if (score % 5 === 0) {
                speed += 2;                         // Збільшення швидкості кожні 3 монетки
            }
        }

        animationId = requestAnimationFrame(startGame);  // Запуск наступної ітерації гри
    }

    function treesAnimation() {                     // Анімація дерев
        for (let i = 0; i < trees.length; i++) {
            const tree = trees[i];
            const coords = treesCoords[i];

            let newYCoord = coords.y + speed;

            if (newYCoord > window.innerHeight) {  // Якщо дерево виходить за межі вікна, переміщаємо його нагору
                newYCoord = -370;
            }

            treesCoords[i].y = newYCoord;
            tree.style.transform = `translate(${coords.x}px, ${newYCoord}px)`;
        }
    }

    function elementAnimation(elem, elemInfo, elemInitialYCoord) {  // Анімація елементів гри
        let newYCoord = elemInfo.coords.y + speed;
        let newXCoord = elemInfo.coords.x;

        if (newYCoord > window.innerHeight) {            // Якщо елемент виходить за межі вікна
            newYCoord = elemInitialYCoord;               // Перемістимо його нагору

            const direction = parseInt(Math.random() * 2);  // Випадкове визначення напрямку
            const maxXCoord = (roadWidth + 1 - elemInfo.width);  // Максимальна ширина відображення елемента
            const randomXCoord = parseInt(Math.random() * maxXCoord);  // Випадкове визначення початкової координати X

            if (direction === 0) {                        // Якщо direction = 0, елемент буде рухатися вліво
                newXCoord = -randomXCoord;
            }
            else if (direction === 1) {                   // Якщо direction = 1, елемент буде рухатися вправо
                newXCoord = randomXCoord;
            }

            elem.style.display = 'initial';               // Показуємо елемент
            elemInfo.visible = true;                      // Встановлюємо прапорець видимості елемента

            newXCoord = direction === 0 // Тернарний оператор
                ? -randomXCoord
                : randomXCoord;
        }

        elemInfo.coords.y = newYCoord;                    // Оновлення координат елемента
        elemInfo.coords.x = newXCoord;
        elem.style.transform = `translate(${newXCoord}px, ${newYCoord}px)`;  // Застосування трансформації
    }

    function getCoords(element) {                        // Отримання координат елемента
        const matrix = window.getComputedStyle(element).transform;
        const array = matrix.split(',');
        const y = array[array.length - 1];
        const x = array[array.length - 2];
        const numericY = parseFloat(y);
        const numericX = parseFloat(x);

        return { x: numericX, y: numericY };
    }

    function hasCollision(elem1Info, elem2Info) {        // Перевірка на зіткнення двох елементів
        const carYTop = elem1Info.coords.y;
        const carYBottom = elem1Info.coords.y + elem1Info.height;

        const carXLeft = elem1Info.coords.x - elem1Info.width;
        const carXRight = elem1Info.coords.x + elem1Info.width;

        const coinYTop = elem2Info.coords.y;
        const coinYBottom = elem2Info.coords.y + elem2Info.height;

        const coinXLeft = elem2Info.coords.x - elem2Info.width;
        const coinXRight = elem2Info.coords.x + elem2Info.width;

        // Перевірка по осі Y
        if (carYTop > coinYBottom || carYBottom < coinYTop) {
            return false;
        }

        // Перевірка по осі X
        if (carXLeft > coinXRight || carXRight < coinXLeft) {
            return false;
        }

        return true;
    }

    function cancelAnimations() {                         // Відміна всіх анімацій
        cancelAnimationFrame(animationId);
        cancelAnimationFrame(carInfo.move.top);
        cancelAnimationFrame(carInfo.move.bottom);
        cancelAnimationFrame(carInfo.move.left);
        cancelAnimationFrame(carInfo.move.right);
    }

    function finishGame() {                               // Завершення гри
        cancelAnimations();                                // Відміна анімацій

        const carSound = document.getElementById('carSound');
        carSound.pause();                                  // Припинення відтворення звуку автомобіля
        carSound.currentTime = 0;                         // Перемотування звуку на початок

        const gameOverSound = document.getElementById('dangerSound');
        gameOverSound.play();                              // Відтворення звуку завершення гри

        gameScore.style.display = 'none';                  // Приховання рахунку
        gameButton.style.display = 'none';                 // Приховання кнопки "Play"
        backdrop.style.display = 'flex';                   // Показ заднього плану

        const scoreText = backdrop.querySelector('.finish-text-score');
        scoreText.innerText = score;                       // Відображення набраних очок

        if (score > highScore) {                           // Перевірка на побиття рекорду
            highScore = score;
            localStorage.setItem('highScore', highScore); // Оновлення найкращого результату в локальному сховищі
            highScoreElement.innerText = highScore;       // Оновлення відображення найкращого результату

        }

    }

    gameButton.addEventListener('click', () => {          // Обробник подій для натискання кнопки "Play"
        isPause = !isPause;                                // Зміна прапорця паузи

        if (isPause) {
            cancelAnimations();                            // Якщо гра на паузі, відміняємо всі анімації

            gameButton.children[0].style.display = 'none'; // Приховуємо іконку "Play"
            gameButton.children[1].style.display = 'initial'; // Показуємо іконку "Pause"
        }
        else {
            animationId = requestAnimationFrame(startGame);  // Якщо гра не на паузі, продовжуємо гру
            gameButton.children[0].style.display = 'initial'; // Показуємо іконку "Play"
            gameButton.children[1].style.display = 'none';    // Приховуємо іконку "Pause"
        }
    });

    restartButton.addEventListener('click', () => {        // Обробник подій для натискання кнопки "Restart"
        window.location.reload();                           // Перезавантаження сторінки
    });
})();                                                      // Кінець самовикликаючої функції

function updateClock() {                                    // Функція оновлення годинника
    const now = new Date();                                 // Поточна дата та час

    const hour = padZero(now.getHours());                   // Години
    const minute = padZero(now.getMinutes());               // Хвилини
    const second = padZero(now.getSeconds());               // Секунди

    document.querySelector('.hour').textContent = hour;     // Оновлення годин
    document.querySelector('.minute').textContent = minute; // Оновлення хвилин
    document.querySelector('.second').textContent = second; // Оновлення секунд

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);
    document.querySelector('.date').textContent = dateString; // Оновлення дати
}

function padZero(num) {                                     // Додавання нуля до числа, якщо воно одноцифрове
    return (num < 10 ? '0' : '') + num;
}

// Оновлюємо годинник кожну секунду
setInterval(updateClock, 1000);

// Спочатку відображаємо годинник і дату
updateClock();


const apiKey = '1a2c6a8473d26a256d7f4fd2feaacf88'; // Ваш ключ API погодного сервісу
const city = 'Napoli'; // Назва міста або координати (наприклад, 'Kyiv' або '50.45,30.523')

// Функція для отримання погодних даних через API
async function getWeather() {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// Функція для оновлення елементів на сторінці з погодними даними
async function updateWeather() {
    const weatherData = await getWeather();
    if (weatherData) {
        const temperature = weatherData.main.temp;
        const description = weatherData.weather[0].description;
        const iconCode = weatherData.weather[0].icon;

        // Оновлення елементів на сторінці з погодними даними
        document.querySelector('.temperature').textContent = `${temperature}°C`;
        document.querySelector('.description').textContent = description;

        // Вставка значка погоди (можливо, потрібно використати URL для іконок з вашого погодного API)
        const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;
        document.querySelector('.weather-icon').src = iconUrl;
    }
}

// Виклик функції оновлення погоди
updateWeather();

// Оновлення погоди кожні 10 хвилин
setInterval(updateWeather, 600000); // 600000 мс = 10 хвилин