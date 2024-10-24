import Reel from "./Reel.js";
import Symbol from "./Symbol.js";

export default class Slot {
  constructor(domElement, config = {}) {
    Symbol.preload();

    this.currentSymbols = [
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
    ];

    this.nextSymbols = [
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
      ["death_star", "death_star", "death_star"],
    ];

    this.userId = null; // Объявляем userId

    document.addEventListener("DOMContentLoaded", () => {
      // Функция для получения значения параметра из URL
      function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
      }

      // Получаем значение параметра userid
      this.userId = getQueryParam("userid");

      // Выводим значение в консоль (или используем его по своему усмотрению)
      console.log("User ID:", this.userId);
    });

    document.addEventListener("DOMContentLoaded", () => {
      this.fetchUserBalance();
    });

    this.container = domElement;

    this.reels = Array.from(this.container.getElementsByClassName("reel")).map(
      (reelContainer, idx) =>
        new Reel(reelContainer, idx, this.currentSymbols[idx])
    );

    this.spinButton = document.getElementById("spin");
    this.spinButton.addEventListener("click", () => this.spin());

    this.autoPlayCheckbox = document.getElementById("autoplay");

    if (config.inverted) {
      this.container.classList.add("inverted");
    }

    this.config = config;

    // Добавляем элементы управления ставками
    this.incrementBtns = [
      document.getElementById("incrementBtn-1"),
      document.getElementById("incrementBtn-2"),
      document.getElementById("incrementBtn-3"),
      document.getElementById("incrementBtn-4"),
      document.getElementById("incrementBtn-5"),
      document.getElementById("incrementBtn-6"),
    ];

    this.decrementBtns = [
      document.getElementById("decrementBtn-1"),
      document.getElementById("decrementBtn-2"),
      document.getElementById("decrementBtn-3"),
      document.getElementById("decrementBtn-4"),
      document.getElementById("decrementBtn-5"),
      document.getElementById("decrementBtn-6"),
    ];

    this.betElement = document.getElementById("bet");
    this.balanceElement = document.getElementById("balance");
    this.betInput = document.getElementById("form-bet");
    this.clearButton = document.getElementById("clear-btn");
    this.allInButton = document.getElementById("all-in-btn");
    this.yesButton = document.getElementById("yes-btn");
    this.windowTextElement = document.getElementById("window-popup-text");
    // Инициализируем значение ставки
    this.balance = 0;
    this.bet = 0.0;
    this.windowText = "";

    this.betInput.addEventListener("input", () => this.updateBetFromInput());
    // Добавляем обработчики событий для кнопок управления ставками
    this.incrementBtns.forEach((btn, index) => {
      btn.addEventListener("click", () => this.incrementBet(index));
    });

    this.decrementBtns.forEach((btn, index) => {
      btn.addEventListener("click", () => this.decrementBet(index));
    });

    // Добавляем обработчик события для кнопки CLEAR
    this.yesButton.addEventListener("click", () => this.closeModal());
    this.clearButton.addEventListener("click", () => this.clearBet());

    this.allInButton.addEventListener("click", () => this.allInBet());

    // Инициализация значения ставки на экране
    this.updateBet();
  }

  fetchUserBalance = async () => {
    try {
      const response = await axios.get(
        `https://printhiegprog-casino-server-fa31.twc1.net/api/get-balance/${this.userId}`
      );
      this.balance = response.data.balance;
      this.updateBalanceElement();
    } catch (err) {
      console.error("Error fetching user balance:", err);
    }
  };

  updateBalance = async () => {
    try {
      const response = await axios.post(
        "https://printhiegprog-casino-server-fa31.twc1.net/api/update-balance",
        {
          entries: [{ userId: this.userId, balance: parseFloat(this.balance) }],
        }
      );
      this.updateBalanceElement();
    } catch (err) {
      console.error("Error updating user balance:", err);
    }
  };

  // Метод для обновления значения ставки на экране
  updateBet() {
    this.betElement.textContent = this.bet.toFixed(2);
  }

  updateBalanceElement() {
    this.balanceElement.textContent = this.balance.toFixed(2);
  }

  updateWindowText() {
    this.windowTextElement.textContent = this.windowText;
  }

  updateBetFromInput() {
    const value = parseFloat(this.betInput.value);
    if (!isNaN(value)) {
      this.bet = parseFloat(value.toFixed(2));
      this.updateBet();
    } else {
      this.bet = 0.0;
      this.updateBet();
    }
  }

  // Метод для увеличения ставки
  incrementBet(index) {
    const increments = [0.1, 1.0, 10.0, 50.0, 100.0, 500.0];
    this.bet += increments[index];
    this.updateBet();
  }

  // Метод для уменьшения ставки
  decrementBet(index) {
    const decrements = [0.1, 1.0, 10.0, 50.0, 100.0, 500.0];
    if (this.bet > 0) {
      if (decrements[index] <= this.bet) {
        this.bet -= decrements[index];
        this.updateBet();
      }
    }
  }
  openModal() {
    document.querySelector(".CheckYearsOld").style.display = "block";
  }

  closeModal() {
    document.querySelector(".CheckYearsOld").style.display = "none";
  }

  // Метод для очистки ставки
  clearBet() {
    this.bet = 0.0;
    this.updateBet();
  }

  allInBet() {
    this.bet = this.balance;
    this.updateBet();
  }

  spin() {
    this.updateBalance();
    this.updateBet();
    this.fetchUserBalance();
    if (this.bet > 0) {
      if (this.balance >= this.bet) {
        this.balance = this.balance - this.bet;
        this.updateBalance();
        this.updateBet();
        this.currentSymbols = this.nextSymbols;
        this.nextSymbols = [
          [Symbol.random(), Symbol.random(), Symbol.random()],
          [Symbol.random(), Symbol.random(), Symbol.random()],
          [Symbol.random(), Symbol.random(), Symbol.random()],
          [Symbol.random(), Symbol.random(), Symbol.random()],
          [Symbol.random(), Symbol.random(), Symbol.random()],
        ];

        this.onSpinStart(this.nextSymbols);

        return Promise.all(
          this.reels.map((reel) => {
            reel.renderSymbols(this.nextSymbols[reel.idx]);
            return reel.spin();
          })
        ).then(() => this.onSpinEnd(this.nextSymbols));
      } else {
        this.windowText = "Недостаточно средств";
        this.updateWindowText();
        this.openModal();
      }
    } else {
      this.windowText = "Сделайте ставку";
      this.updateWindowText();
      this.openModal();
    }
  }

  onSpinStart(symbols) {
    this.spinButton.disabled = true;
    const incrementBtn1 = document.getElementById("incrementBtn-1");
    const incrementBtn2 = document.getElementById("incrementBtn-2");
    const incrementBtn3 = document.getElementById("incrementBtn-3");
    const incrementBtn4 = document.getElementById("incrementBtn-4");
    const incrementBtn5 = document.getElementById("incrementBtn-5");
    const incrementBtn6 = document.getElementById("incrementBtn-6");
    const decrementBtn1 = document.getElementById("decrementBtn-1");
    const decrementBtn2 = document.getElementById("decrementBtn-2");
    const decrementBtn3 = document.getElementById("decrementBtn-3");
    const decrementBtn4 = document.getElementById("decrementBtn-4");
    const decrementBtn5 = document.getElementById("decrementBtn-5");
    const decrementBtn6 = document.getElementById("decrementBtn-6");
    const clearButton = document.getElementById("clear-btn");
    const allInButton = document.getElementById("all-in-btn");
    incrementBtn1.disabled = true;
    incrementBtn2.disabled = true;
    incrementBtn3.disabled = true;
    incrementBtn4.disabled = true;
    incrementBtn5.disabled = true;
    incrementBtn6.disabled = true;
    decrementBtn1.disabled = true;
    decrementBtn2.disabled = true;
    decrementBtn3.disabled = true;
    decrementBtn4.disabled = true;
    decrementBtn5.disabled = true;
    decrementBtn6.disabled = true;
    allInButton.disabled = true;
    clearButton.disabled = true;

    this.config.onSpinStart?.(symbols);
  }

  onSpinEnd(symbols) {
    this.spinButton.disabled = false;
    const incrementBtn1 = document.getElementById("incrementBtn-1");
    const incrementBtn2 = document.getElementById("incrementBtn-2");
    const incrementBtn3 = document.getElementById("incrementBtn-3");
    const incrementBtn4 = document.getElementById("incrementBtn-4");
    const incrementBtn5 = document.getElementById("incrementBtn-5");
    const incrementBtn6 = document.getElementById("incrementBtn-6");
    const decrementBtn1 = document.getElementById("decrementBtn-1");
    const decrementBtn2 = document.getElementById("decrementBtn-2");
    const decrementBtn3 = document.getElementById("decrementBtn-3");
    const decrementBtn4 = document.getElementById("decrementBtn-4");
    const decrementBtn5 = document.getElementById("decrementBtn-5");
    const decrementBtn6 = document.getElementById("decrementBtn-6");
    const clearButton = document.getElementById("clear-btn");
    const allInButton = document.getElementById("all-in-btn");
    incrementBtn1.disabled = false;
    incrementBtn2.disabled = false;
    incrementBtn3.disabled = false;
    incrementBtn4.disabled = false;
    incrementBtn5.disabled = false;
    incrementBtn6.disabled = false;
    decrementBtn1.disabled = false;
    decrementBtn2.disabled = false;
    decrementBtn3.disabled = false;
    decrementBtn4.disabled = false;
    decrementBtn5.disabled = false;
    decrementBtn6.disabled = false;
    allInButton.disabled = false;
    clearButton.disabled = false;

    this.config.onSpinEnd?.(symbols);

    if (this.autoPlayCheckbox.checked) {
      return window.setTimeout(() => this.spin(), 200);
    }

    // Проверка на выигрыш
    const jackpotResult = this.checkForJackpot(symbols);
    if (
      jackpotResult.three > 0 ||
      jackpotResult.four > 0 ||
      jackpotResult.five > 0 ||
      jackpotResult.vertThree > 0
    ) {
      if (jackpotResult.three > 0) {
        let jackpot = jackpotResult.three * this.bet;
        jackpot = jackpot * 5;
        this.balance = this.balance + jackpot;
        this.updateBalance();
      }
      if (jackpotResult.four > 0) {
        let jackpot = jackpotResult.four * this.bet;
        jackpot = jackpot * 10;
        this.balance = this.balance + jackpot;
        this.updateBalance();
      }
      if (jackpotResult.five > 0) {
        let jackpot = jackpotResult.five * this.bet;
        jackpot = jackpot * 100;
        this.balance = this.balance + jackpot;
        this.updateBalance();
      }
      if (jackpotResult.vertThree > 0) {
        let jackpot = jackpotResult.vertThree * this.bet;
        jackpot = jackpot * 2;
        this.balance = this.balance + jackpot;
        this.updateBalance();
      }
      this.updateBalance();
    } else {
      this.updateBalance();
    }
  }

  checkForJackpot(symbols) {
    const result = {
      three: 0,
      four: 0,
      five: 0,
      vertThree: 0,
    };

    // Проверка каждого горизонтального ряда
    for (let row = 0; row < symbols[0].length; row++) {
      for (let reel = 0; reel < symbols.length; reel++) {
        let count = 1;
        for (let i = reel + 1; i < symbols.length; i++) {
          if (symbols[i][row] === symbols[i - 1][row]) {
            count++;
          } else {
            break;
          }
        }

        if (count >= 3) {
          if (count === 3) {
            result.three++;
          } else if (count === 4) {
            result.four++;
          } else if (count === 5) {
            result.five++;
          }
          reel += count - 1; // Пропускаем уже проверенные символы
        }
      }
    }

    for (let col = 0; col < symbols.length; col++) {
      for (let row = 0; row < symbols[col].length; row++) {
        let count = 1;
        for (let i = row + 1; i < symbols[col].length; i++) {
          if (symbols[col][i] === symbols[col][i - 1]) {
            count++;
          } else {
            break;
          }
        }

        if (count >= 3) {
          if (count === 3) {
            result.vertThree++;
          } else if (count === 4) {
            //
          } else if (count === 5) {
            //
          }
          row += count - 1; // Пропускаем уже проверенные символы
        }
      }
    }

    return result;
  }
}
