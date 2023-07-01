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
          let currentLetter = letters[rowNumber * ANSWER_LENGTH + i];
          currentLetter.classList.add("invalid-letter");
          
          setTimeout(function(letter) {
            return function() {
              letter.classList.remove("invalid-letter");
            }
          }(currentLetter), 820);
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
          letters[rowNumber * ANSWER_LENGTH + i].classList.add(
            "letter-correct"
          );
          letterMap.set(currentWord[i], letterMap.get(currentWord[i]) - 1);
        }
      }

      if (currentWord === wordOfDay) {
        alert("YOU WON");
        gameOver = true;
      } else {
        //Check if word exists and identify words colors

        for (let i = 0; i < 5; i++) {
          if (currentWord[i] == wordOfDay[i]) {
            //NADA
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
      currentLetter = letters[rowNumber * ANSWER_LENGTH + currentWord.length - 1];
      currentLetter.innerHTML =
        letter;

      currentLetter.classList.add(
        "letter-selected"
      );

      setTimeout(function(letter) {
        return function() {
          letter.classList.remove("letter-selected");
        }
      }(currentLetter), 50);
    }
  }
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

init();
