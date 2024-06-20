function generateHexagons() {
  let hexagons = document.getElementsByClassName('hexagon');
  for(let hexagon of hexagons) {
    hexagon.remove();
  }
  const container = document.getElementById('hexagon-container');
  container.innerHTML = "";

  let lettersUsed = [];
  for (let i = 0; i < 7; i++) {
      const hexagon = document.createElement('div');
      hexagon.className = 'hexagon';
      let randomLetter = "";
      let random = 0;
      if(i<6) {
        while(lettersUsed.indexOf(randomLetter) > -1 || randomLetter == "") {
          random = Math.floor(Math.random() * outerLetters.length);
          randomLetter = outerLetters[random].toUpperCase();
        }
        lettersUsed.push(randomLetter);
      }
      else {
        randomLetter = centerLetter.toUpperCase();
      }
      hexagon.innerHTML = randomLetter;
      hexagon.addEventListener('click', () => {
          clickLetter(randomLetter);
      });
      hexagon.addEventListener('mouseover', () => {
          hexagon.style.backgroundColor = '#ffff77';
      });
      hexagon.addEventListener('mouseout', () => {
          hexagon.style.backgroundColor = '#eeee99';
      });
      container.appendChild(hexagon);
      hexagonLetters[randomLetter] = hexagon;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  generateHexagons();
  setupButtons();
  //hideStuff();
  updateGameDatabase();
  document.addEventListener('keydown', handleKeyPress);
  for(let word of answers){
    totalScore += wordPoints(word);
  }
  
});


 
function updateGameDatabase(){
  
  if(auth == ""){
    recalculateScore();
    return;
  }
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
 
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      //console.log(xmlhttp.responseText);
      var data = JSON.parse(xmlhttp.responseText);
      //set some globals
      gameId = data["game_id"];
      foundWords = data["found_words"];
      //console.log(foundWords);
      updateFoundWords();
      recalculateScore();
    }
  }

  let data = {"answers": answers, "panagrams": panagrams, "centerLetter": centerLetter, "outerLetters": outerLetters};
  let userData = {"found_words": foundWords};
  const params = new URLSearchParams();
  
  params.append("auth", auth);
  params.append("game_type_id", game_type_id);
  params.append("game_id", game_id);
  params.append("data", JSON.stringify(data));
  params.append("user_data", JSON.stringify(userData));
  params.append("action", "savegame");
  let url = "data.php"; 
  //console.log(url);
  xmlhttp.open("POST", url, true);
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlhttp.send(params);
}

function clickLetter(letter){
  currentWord += letter;
  let thisDiv = document.getElementById("currentword");
  thisDiv.innerHTML = currentWord;
  thisDiv.style.display = "block";
  
}


function deleteLetter(letter){
  if(currentWord != "") {
    currentWord = currentWord.substring(0, currentWord.length-1);
    document.getElementById("currentword").innerHTML = currentWord;
  }
  return false;
}


function enterWord(){
  let message = "";
  let delay = 2000;
  let color = "#ffff99";
  if(answers.indexOf(currentWord.toLowerCase()) > -1 && foundWords.indexOf(currentWord.toLowerCase()) ==-1){
  
    foundWords.push(currentWord.toLowerCase()); 
 
    let wordScore = wordPoints(currentWord);
    
    if(panagrams.indexOf(currentWord.toLowerCase()) > -1) {
      message = "You found a panagram! +" + wordScore + " points!";
      color = '#ccffff';
      delay = 3000;
    }
    else
    {
      message = "You found a word! +" + wordScore + " points!"; 
      if(wordScore >6){
        color = '#ccffcc';
      } else if(wordScore >4){
        color = '#99ff99';

      } else {

        color = '#33ff33';
      }

      
    }
    

    console.log(foundWords);
    updateGameDatabase();
  } else if (currentWord.length < 4 && currentWord.toLowerCase().indexOf(centerLetter) == -1) {
    message = "Your word was too short and didn't contain a '" + centerLetter + "'!"
    color = '#ff9999';
  } else if (currentWord.length < 4) {
    message = "Your word was too short!";
    color = '#ff9999';
  } else if (currentWord.toLowerCase().indexOf(centerLetter) == -1) {
    message = "Your word must contain '" + centerLetter + "'!";
  } else if (foundWords.indexOf(currentWord.toLowerCase()) > -1) {
    color = '#ff9999';
    message = "You already found that word!";
    color = '#ffcc99';
  } else {
    message = "That's not a word!";
    color = '#ff9999';
  }
  currentWord = "";
  document.getElementById("currentword").innerHTML = currentWord;
  let messageDiv = document.getElementById("message");
  messageDiv.innerHTML = message;
  messageDiv.style.display = 'block';
  updateFoundWords();
  let thisDiv = document.getElementById("currentword");
  thisDiv.style.display = "none";
  messageDiv.style.backgroundColor  = color;
  backToPlay();
  setTimeout(()=>{
    messageDiv.style.display = 'none';
    
  }, delay);
  return false;
}

function recalculateScore() {
  let scoreDiv = document.getElementById("score");
  score = 0;
  for(let word of foundWords){
    //console.log(word,wordPoints(word) );
    score += wordPoints(word);
  }
  if(totalScore > 0 ) {
    let fraction = score/totalScore;
   
    if (fraction >= 1) {
      level = "Queen Bee";  
    } else  if (fraction >= 0.70) {
      level = "Genius";  
    } else  if (fraction >= 0.50) {
      level = "Amazing"; 
    } else  if (fraction >= 0.40) {
      level = "Great";  
    } else  if (fraction >= 0.25) {
      level = "Nice";
    } else  if (fraction >= 0.15) {
      level = "Solid";
    } else  if (fraction >= 0.08) {
      level = "Good";
    } else  if (fraction >= 0.05) {
      level = "Moving up";
    } else if(fraction < 0.02) {
        level = "Good start"
    }
  }
  scoreDiv.innerHTML = "Score: " + score + " points; Level: " + level;
  scoreDiv.style.display = 'block';
}

function shuffle(){
  generateHexagons();
  return false;
}

function updateFoundWords() {
  let foundWordsDiv = document.getElementById("foundwords");
  let sortAlphabetically = document.getElementById("sortAlphabetically").checked;
  foundWordsDiv.innerHTML = "";
  //console.log(foundWords);
  let wordsToShow = [...foundWords]

  if(sortAlphabetically) {
    wordsToShow = wordsToShow.sort();
  }
  //console.log(wordsToShow);
  for(let word of wordsToShow){
    if(panagrams.indexOf(word.toLowerCase()) > -1) {
      foundWordsDiv.innerHTML+= "<div class='panagram'>" + word + "</div>";
    } else {
      foundWordsDiv.innerHTML+= "<div>" + word + "</div>";
    }
  }
  if(wordsToShow.length > 0) {
    foundWordsDiv.style.display = "block";
  }
}


function wordPoints(word) {
  let points = word.length;
  if(word.length == 4) {
    points = 1;
  } else if (panagrams.indexOf(word.toLowerCase()) > -1) {
    points = points + 7;
  }
  return points;
}

function backToPlay(){
  let scoreDiv = document.getElementById("score");
  scoreDiv.style.display = "block";
  scoreDiv = document.getElementById("message");
  scoreDiv.style.display = "block";
  scoreDiv = document.getElementById("foundwords");
  scoreDiv.style.display = "block";
}

function hideStuff() {
  let scoreDiv = document.getElementById("score");
  scoreDiv.style.display = "none";
  scoreDiv = document.getElementById("message");
  scoreDiv.style.display = "none";
  scoreDiv = document.getElementById("foundwords");
  scoreDiv.style.display = "none";
}

function handleKeyPress(event) {
    const key = event.key;
    //console.log(key);
    if (hexagonLetters[key.toUpperCase()]) {
        clickLetter(key.toUpperCase());
    } else if (buttonKeys[key]) {
        buttonKeys[key].click();
    }
}

function setupButtons() {
  const buttons = document.querySelectorAll('.buttons button');
  buttons.forEach(button => {
      const key = button.getAttribute('data-key');
      if (key) {
          buttonKeys[key] = button;
          button.addEventListener('click', () => {
          });
      }
  });
}

