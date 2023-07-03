const ANSWER_LENGTH = 5;
const NUM_ANSWERS = 6;
const letters = document.querySelectorAll(".game-word");
const keys = document.querySelector(".keyboard");

async function init() {
  let rowNumber = 0;
  let currentWord = "";
  let gameOver = false;

  const wordAPI = await fetch(
    "https://words.dev-apis.com/word-of-the-day?random=1"
  );
  const wordJSON = await wordAPI.json();
  const wordOfDay = wordJSON.word;

  console.log(wordOfDay);

  document.addEventListener("keyup", function (event) {
    if (gameOver) {
      return;
    }

    const letter = event.key;
    if (letter === "Enter") {
      handleEnter();
    } else if (letter === "Backspace") {
      handleBackSpace();
    } else if (isLetter(letter) == true) {
      handleLetter(letter);
    }
  });

  keys.addEventListener("click", function (event) {
    if (!event.target.classList.contains("key")) {
      return;
    }

    let pressed = event.target.textContent;

    if (pressed == "ENTER") {
      handleEnter();
    } else if (pressed == "DEL") {
      handleBackSpace();
    } else {
      handleLetter(pressed.toLowerCase());
    }
  });

  async function handleEnter() {
    if (currentWord.length === 5) {
      // TODO
      const validateWord = await fetch(
        "https://words.dev-apis.com/validate-word",
        {
          method: "POST",
          body: JSON.stringify({ word: currentWord }),
        }
      );
      const validation = await validateWord.json();
      wordIsValid = validation.validWord;

      if (!wordIsValid) {
        for (let i = 0; i < 5; i++) {
          let currentLetter = letters[rowNumber * ANSWER_LENGTH + i];
          currentLetter.classList.add("invalid-letter");

          setTimeout(
            (function (letter) {
              return function () {
                letter.classList.remove("invalid-letter");
              };
            })(currentLetter),
            820
          );
        }
        return;
      }

      const letterMap = new Map();
      for (const letter of wordOfDay) {
        letterMap.set(letter, (letterMap.get(letter) || 0) + 1);
      }

      //Check first for correct
      for (let i = 0; i < 5; i++) {
        if (currentWord[i] == wordOfDay[i]) {
          setTimeout(
            (function (letter) {
              return function () {
                letter.classList.add("letter-correct");
              };
            })(letters[rowNumber * ANSWER_LENGTH + i]),
            250 * i
          );
          letterMap.set(currentWord[i], letterMap.get(currentWord[i]) - 1);
        }
      }

      if (currentWord === wordOfDay) {
        alert("YOU WON");
        gameOver = true;
      } else {
        //Check if word exists and identify words colors
        let keyColor;
        for (let i = 0; i < 5; i++) {
          if (currentWord[i] == wordOfDay[i]) {
            keyColor = "#538d4e";
          } else if (
            letterMap.has(currentWord[i]) &&
            letterMap.get(currentWord[i]) > 0
          ) {
            setTimeout(
              (function (letter) {
                return function () {
                  letter.classList.add("letter-present");
                };
              })(letters[rowNumber * ANSWER_LENGTH + i]),
              250 * i
            );

            letterMap.set(currentWord[i], letterMap.get(currentWord[i]) - 1);

            keyColor = "#b59f3b";
          } else {
            setTimeout(
              (function (letter) {
                return function () {
                  letter.classList.add("letter-wrong");
                };
              })(letters[rowNumber * ANSWER_LENGTH + i]),
              250 * i
            );

            keyColor = "#3a3a3c";
          }

          setTimeout(
            (function (letter, color) {
              return function () {
                keyboardKeysColor(letter.toUpperCase(), color);
              };
            })(currentWord[i], keyColor),
            2000
          );
          let delay = 500 * i;
          let whatLetter = currentWord[i].toUpperCase();
          setTimeout(function () {
            keyboardKeysColor(whatLetter, keyColor);
          }, delay);
        }

        //Go next line
        rowNumber++;
        currentWord = "";
      }

      if (rowNumber === NUM_ANSWERS) {
        gameOver = true;
        alert(`GAME OVER, THE WORD WAS "${wordOfDay}"`);
      }
    }
  }
  function handleBackSpace() {
    if (currentWord != "") {
      currentWord = currentWord.slice(0, -1);
      letters[rowNumber * ANSWER_LENGTH + currentWord.length].innerHTML = "";
      letters[rowNumber * ANSWER_LENGTH + currentWord.length].classList.remove(
        "letter-selected"
      );
    }
  }
  function handleLetter(letter) {
    if (currentWord.length < ANSWER_LENGTH) {
      currentWord += letter;
      currentLetter =
        letters[rowNumber * ANSWER_LENGTH + currentWord.length - 1];
      currentLetter.innerHTML = letter;

      currentLetter.classList.add("letter-selected");

      setTimeout(
        (function (letter) {
          return function () {
            letter.classList.remove("letter-selected");
          };
        })(currentLetter),
        50
      );
    }
  }
}

function keyboardKeysColor(letter, color) {
  console.log(letter, color);
  const elements = document.querySelectorAll(".key");
  for (const element of elements) {
    if (element.innerHTML == letter) {
      if (element.style.backgroundColor == "#538d4e") {
        return;
      }
      if (element.style.backgroundColor == "#b59f3b" && color != "#538d4e") {
        return;
      }
      element.style.backgroundColor = color;
    }
  }
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

init();
