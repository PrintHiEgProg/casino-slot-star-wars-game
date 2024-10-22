(function () {
  // Symbol.js
  const Symbol = (function () {
    const cache = {};

    class Symbol {
      constructor(name = Symbol.random()) {
        this.name = name;

        if (cache[name]) {
          this.img = cache[name].cloneNode();
        } else {
          this.img = new Image();
          this.img.src = `../assets/symbols/${name}.svg`;

          cache[name] = this.img;
        }
      }

      static preload() {
        Symbol.symbols.forEach((symbol) => new Symbol(symbol));
      }

      static get symbols() {
        return [
          "at_at",
          "c3po",
          "darth_vader",
          "death_star",
          "falcon",
          "r2d2",
          "stormtrooper",
          "tie_ln",
          "yoda",
        ];
      }

      static random() {
        return this.symbols[Math.floor(Math.random() * this.symbols.length)];
      }
    }

    return Symbol;
  })();

  // Reel.js
  const Reel = (function () {
    class Reel {
      constructor(reelContainer, idx, initialSymbols) {
        this.reelContainer = reelContainer;
        this.idx = idx;

        this.symbolContainer = document.createElement("div");
        this.symbolContainer.classList.add("icons");
        this.reelContainer.appendChild(this.symbolContainer);

        this.animation = this.symbolContainer.animate(
          [
            { top: 0, filter: "blur(0)" },
            { filter: "blur(2px)", offset: 0.5 },
            {
              top: `calc((${Math.floor(this.factor) * 10} / 3) * -100% - (${
                Math.floor(this.factor) * 10
              } * 3px))`,
              filter: "blur(0)",
            },
          ],
          {
            duration: this.factor * 1000,
            easing: "ease-in-out",
          }
        );
        this.animation.cancel();

        initialSymbols.forEach((symbol) =>
          this.symbolContainer.appendChild(new Symbol(symbol).img)
        );
      }

      get factor() {
        return 1 + Math.pow(this.idx / 2, 2);
      }

      renderSymbols(nextSymbols) {
        const fragment = document.createDocumentFragment();

        for (let i = 3; i < 3 + Math.floor(this.factor) * 10; i++) {
          const icon = new Symbol(
            i >= 10 * Math.floor(this.factor) - 2
              ? nextSymbols[i - Math.floor(this.factor) * 10]
              : undefined
          );
          fragment.appendChild(icon.img);
        }

        this.symbolContainer.appendChild(fragment);
      }

      spin() {
        const animationPromise = new Promise(
          (resolve) => (this.animation.onfinish = resolve)
        );
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(resolve, this.factor * 1000)
        );

        this.animation.cancel();
        this.animation.play();

        return Promise.race([animationPromise, timeoutPromise]).then(() => {
          if (this.animation.playState !== "finished") this.animation.finish();

          const max = this.symbolContainer.children.length - 3;

          for (let i = 0; i < max; i++) {
            this.symbolContainer.firstChild.remove();
          }
        });
      }
    }

    return Reel;
  })();

  // Slot.js
  class Slot {
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

      this.container = domElement;

      this.reels = Array.from(
        this.container.getElementsByClassName("reel")
      ).map(
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
      this.balance = 10.0;
      this.bet = 0.0;

      this.incrementBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => this.incrementBet(index));
      });

      this.decrementBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => this.decrementBet(index));
      });

      this.updateBet();
    }

    updateBet() {
      this.betElement.textContent = this.bet.toFixed(2);
    }

    updateBalance() {
      this.balanceElement.textContent = this.balance.toFixed(2);
    }

    incrementBet(index) {
      const increments = [0.1, 1.0, 10.0, 50.0, 100.0, 500.0];
      this.bet += increments[index];
      this.updateBet();
    }

    decrementBet(index) {
      const decrements = [0.1, 1.0, 10.0, 50.0, 100.0, 500.0];
      if (this.bet > 0) {
        if (decrements[index] <= this.bet) {
          this.bet -= decrements[index];
          this.updateBet();
        }
      }
    }

    spin() {
      this.updateBalance();
      this.updateBet();
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
          alert("недостаточно средств");
        }
      } else {
        alert("Сделайте ставку");
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

      this.config.onSpinEnd?.(symbols);

      if (this.autoPlayCheckbox.checked) {
        return window.setTimeout(() => this.spin(), 200);
      }

      const jackpotResult = this.checkForJackpot(symbols);
      if (
        jackpotResult.three > 0 ||
        jackpotResult.four > 0 ||
        jackpotResult.five > 0
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
      } else {
        // проигрыш
      }
    }

    checkForJackpot(symbols) {
      const result = {
        three: 0,
        four: 0,
        five: 0,
      };

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
            reel += count - 1;
          }
        }
      }

      return result;
    }
  }

  // Экспортируем класс Slot
  window.Slot = Slot;
})();
