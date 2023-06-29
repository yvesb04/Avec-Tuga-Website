const ANSWER_LENGTH = 5;
const NUM_ANSWERS = 6;
const letters = document.querySelectorAll(".game-word");

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
    console.log(currentWord);
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
          letterNow = letters[rowNumber * ANSWER_LENGTH + i];
          letterNow.classList.remove("invalid-letter");
          setTimeout(function () {
            letters[rowNumber * ANSWER_LENGTH + i].classList.add(
              "invalid-letter"
            );
          }, 10);
        }
        return;
      }

      //Check first for correct
      for (let i = 0; i < 5; i++) {
        if (currentWord[i] == wordOfDay[i]) {
          letters[rowNumber * ANSWER_LENGTH + i].classList.add(
            "letter-correct"
          );
        }
      }

      if (currentWord === wordOfDay) {
        alert("YOU WON");
        gameOver = true;
      } else {
        //Check if word exists and identify words colors
        const letterMap = new Map();
        for (const letter of wordOfDay) {
          letterMap.set(letter, (letterMap.get(letter) || 0) + 1);
        }

        for (let i = 0; i < 5; i++) {
          if (currentWord[i] == wordOfDay[i]) {
            letterMap.set(currentWord[i], letterMap.get(currentWord[i]) - 1);
          } else if (
            letterMap.has(currentWord[i]) &&
            letterMap.get(currentWord[i]) > 0
          ) {
            letters[rowNumber * ANSWER_LENGTH + i].classList.add(
              "letter-present"
            );
            letterMap.set(currentWord[i], letterMap.get(currentWord[i]) - 1);
          } else {
            letters[rowNumber * ANSWER_LENGTH + i].classList.add(
              "letter-wrong"
            );
          }
        }

        //Go next line
        rowNumber++;
        currentWord = "";
      }

      if (rowNumber === NUM_ANSWERS) {
        gameOver = true;
        alert("GAME FUCKING OVER BRO, BETTER LUCK NEXT TIME :P");
      }
    }
  }
  function handleBackSpace(backspace) {
    if (currentWord != "") {
      currentWord = currentWord.slice(0, -1);
      letters[rowNumber * ANSWER_LENGTH + currentWord.length].innerHTML = "";
    }
  }
  function handleLetter(letter) {
    if (currentWord.length < ANSWER_LENGTH) {
      currentWord += letter;
      letters[rowNumber * ANSWER_LENGTH + currentWord.length - 1].innerHTML =
        letter;
      console.log(letters);
    }
  }
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

init();
