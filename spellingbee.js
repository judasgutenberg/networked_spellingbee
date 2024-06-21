let levelValues = {"Queen Bee": 1, "Genius": 0.7, "Amazing": 0.5, "Great": 0.4, "Nice": 0.25, "Solid": 0.15, "Good": 0.08, "Moving Up": 0.05, "Good start": 0.02, "Beginner": 0}

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
      hexagon.id = 'hexagon-' + randomLetter;
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
      hexagon.addEventListener('click', () => {
        hexagon.style.backgroundColor = '#ff9900';
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
  pointLevels();

});

function updateGameDatabase(justPoll){
  if(auth == ""){
    //if we don't have a user, then let's store the game in the browser
    if(foundWords.length < 1) {
      let jsonFoundWords = localStorage.getItem("foundWords");
      if(jsonFoundWords != ""  && jsonFoundWords != null){
        //console.log(jsonFoundWords);
        foundWords = JSON.parse(jsonFoundWords);
        updateFoundWords();
      }
    } else {
      localStorage.setItem("foundWords", JSON.stringify(foundWords));
    }
    recalculateScore();
    return;
  }
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
 
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      //console.log(xmlhttp.responseText);
      let data = JSON.parse(xmlhttp.responseText);
      //set some globals
      if('messages' in data) {
        let messages = data["messages"];
        showMessages(messages);
      }
      if('game_id' in data){
        gameId = data["game_id"];
      }
      if('other_scores' in data) {
        let otherScores = data["other_scores"];
        others(otherScores);
      }
      if(!justPoll){
        foundWords = data["found_words"];
        //console.log(foundWords);
        updateFoundWords();
        //console.log(otherScores);
        recalculateScore();
        stats();
      }
      setTimeout(()=>{updateGameDatabase(true);},3000);//this makes the game poll the backend for messages and score changes in other games
    }
  }
  const params = new URLSearchParams();
  if(!justPoll){
    let data = {"answers": answers, "panagrams": panagrams, "centerLetter": centerLetter, "outerLetters": outerLetters};
    let userData = {"found_words": foundWords, "score": score, "premium_count": panagramsFound};
    params.append("data", JSON.stringify(data));
    params.append("user_data", JSON.stringify(userData));
  }
  params.append("auth", auth);
  params.append("game_type_id", gameTypeId);
  params.append("game_id", gameId);
  if(justPoll){
    //console.log("polling");
    params.append("action", "poll");
  } else {
    params.append("action", "savegame");
  }
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
  if(currentWord == ""){
    return;
  }
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
    recalculateScore();
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
  
  stats();
  setTimeout(()=>{
    messageDiv.style.display = 'none';
    
  }, delay);
  return false;
}

function recalculateScore() {
  let scoreDiv = document.getElementById("score");
  score = 0;
  panagramsFound = 0;
  for(let word of foundWords){
    //console.log(word,wordPoints(word) );
    score += wordPoints(word);
    if(isPanagram(word)) {
      panagramsFound++;
    }
  }
  if(totalScore > 0 ) {
    let fraction = score/totalScore;
    level = getLevel(fraction);
  }
  scoreDiv.innerHTML = "Score: " + score + " points; Level: " + level;
  scoreDiv.style.display = 'block';
}


function getLevel(fraction) {
  for (const [key, value] of Object.entries(levelValues)) {
      if (fraction >= value) {
          return key;
      }
  }
  return null; // In case no match is found, although with the provided levels, this should not happen
}

function pointLevels(){
  let out = "<div class='header'>Point Levels</div>";
  for (const [key, value] of Object.entries(levelValues)) {
    let levelValue = Math.round(totalScore * value);
    out += "<div class='level'>" + key + ": " + parseInt(levelValue) + "</div>";
  }
  document.getElementById("levellist").innerHTML = out;
}

function showMessages(messages) {
  document.getElementById("communicationmessage").style.display = 'block';
  let out = "";
  if(messages.length > 0) {
    for (let message of messages) {
      messagesRead.push(message["message_id"]);
      out += "<div class='messageheader'>" + message["email"] + " <span class='messagetimedescription'>" + timeAgo(message["created"])  + "</span></div>\n";
      out += "<div class='messagetext'>" + message["message"] + "</div>\n";
      destUserId = message["source_user_id"]; //if you use the text box, it's to the person who last sent you a message
    }
  }
  document.getElementById("receivedmessage").innerHTML = out;

}

function others(otherScores){
  let out = "<div class='header'>Others Playing This Game</div>\n";
  out += "<table class='otherscorestable'>\n";
  out += "<tr class='otherscoresheader'><th>who</th><th> score</th><th> word count</th><th>panagrams</th><th>level</th><th>last active</th><th>message</th></tr>\n";
  //console.log(otherScores, otherScores.length);
  for (let other of otherScores) {
    let fraction = other["score"]/totalScore;
    let level = getLevel(fraction);
    out += "<tr class='otherscores'><td>" + other["email"] + "</td><td> " +  other["score"] +  "</td><td>" + other["item_count"] + "</td><td>" + other["premium_count"] + "</td><td>" + level+ "</td><td>" + timeAgo(other["modified"]) + "</td><td><a class='basicbutton' href='javascript:composeMessage(" + other["user_id"] + ")'>send</a></td></tr>\n";
  }
  out += "</table>\n";
  document.getElementById("others").innerHTML = out;
}

function timeAgo(sqlDateTime) {
  const now = new Date();
  const past = new Date(sqlDateTime);
  const diffInSeconds = Math.floor((now - past) / 1000);
  const seconds = diffInSeconds % 60;
  const minutes = Math.floor(diffInSeconds / 60) % 60;
  const hours = Math.floor(diffInSeconds / 3600) % 24;
  const days = Math.floor(diffInSeconds / 86400);
  if (days > 0) {
      return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  if (hours > 0) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  if (minutes > 0) {
      return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }
  return seconds === 1 ? '1 second ago' : `${seconds} seconds ago`;
}

function composeMessage(destId){
  document.getElementById("communicationmessage").style.display = 'block';
  destUserId = destId;
}

function sendMessage(){
  let messageContent = document.getElementById('sendmessage').value;
  document.getElementById('sendmessage').value = "";
  if(auth == ""){
    recalculateScore();
    return;
  }
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      //console.log(xmlhttp.responseText);
      document.getElementById("communicationmessage").style.display = 'none';
      let data = JSON.parse(xmlhttp.responseText);
    }
  }
  const params = new URLSearchParams();
  params.append("auth", auth);
  params.append("game_type_id", gameTypeId);
  params.append("game_id", gameId);
  params.append("message", messageContent);
  params.append("messages_read", JSON.stringify(messagesRead));
  params.append("dest_user_id", destUserId); //destUserId is a global
  params.append("action", "sendmessage");
  let url = "data.php"; 
  //console.log(url);
  xmlhttp.open("POST", url, true);
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  if(messageContent != "") {
    xmlhttp.send(params);
  } else {
    document.getElementById("communicationmessage").style.display = 'none';
  }
  return false;
}

function stats(){
  let out = "<div class='header'>Your Word Counts by Beginning Letter</div>";
  let longest = answers.reduce((longest, currentWord) => {
    return currentWord.length > longest.length ? currentWord : longest;}, "");
  let lengthOfLongestWord = longest.length;
  let sortedLetters = [...letters];
  sortedLetters = sortedLetters.sort();
  let header = "<tr><td></td>";
  let noheader = true;
  let columnCounts = {};
  for (const letter of sortedLetters) {
    let row = "";
    row += "<tr><td>" + letter.toUpperCase() + "</td>";
    count = 0;
    let total = 0;
    for(let i=4; i<=lengthOfLongestWord; i++) {

      if(noheader){
        header += "<td>" + i + "</td>";
      }
      let count = foundWords
        .filter(word => word.toLowerCase().startsWith(letter.toLowerCase()))
        .filter(word => word.length === i)
        .length;
        row += "<td>" + count + "</td>";
      total += count;
      if(!columnCounts[i]){
        columnCounts[i] =  count;
      } else {
        columnCounts[i] += count;
      }
    }
    row += "<td>" + total+ "</td></tr>";
    if(total > 0){
      out += row;
    }
    noheader = false;
  }
  out +="<tr><td>&Sigma;</td>";
  for(let i=4; i<=lengthOfLongestWord; i++){
    out += "<td>" + columnCounts[i] + "</td>";
  }
  out += "<td>" + foundWords.length + "</td></tr>"
  header += "<td>&Sigma;</td></tr>";
  out = "<table>" + header + out + "</table>";
  let sortedWords = [...foundWords]; 
  let pairs = sortedWords.sort()
    .filter(word => word.length >= 2) // Ensure words have at least 2 characters
    .map(word => word.substring(0, 2).toUpperCase()); 
  let uniquePairs = [...new Set(pairs)];
  noheader = true;
  let out2 = "<div class='header'>Your Word Counts by Beginning Two Letters</div><div>";
  let oldFirstLetter = "";
  for (const pair of uniquePairs) {
    let firstLetter = pair[0];
    if(oldFirstLetter!= firstLetter && oldFirstLetter != ""){
      out2 += "</div><div>" ;
    }
    out2 +=  "&nbsp;" + pair.toUpperCase();
      let count = foundWords
        .filter(word => word.toLowerCase().startsWith(pair.toLowerCase()))
        .length;
      out2 += ":" + count ;

      oldFirstLetter = firstLetter;
  }
  out2 += "</div>";
  document.getElementById("stats").innerHTML = out + out2;
}

function shuffle(){
  generateHexagons();
  return false;
}

function updateFoundWords() {
  let foundWordsDiv = document.getElementById("foundwords2");
  let sortAlphabetically = document.getElementById("sortAlphabetically").checked;
  foundWordsDiv.innerHTML = "";
  foundWordsDiv = document.getElementById("foundwords1");
  foundWordsDiv.innerHTML = "";
  let wordsToShow = JSON.parse(JSON.stringify(foundWords)); 
  if(sortAlphabetically) {
    wordsToShow = wordsToShow.sort();
  }
  let outCount = 0;
  let columnCount1 = 0;
  let columnCount2 = 0;
  for(let word of wordsToShow){
    if(isPanagram(word)) {
      foundWordsDiv.innerHTML+= "<div class='panagram'>" + word + "</div>";
    } else {
      foundWordsDiv.innerHTML+= "<div>" + word + "</div>";
    }
    outCount++;
    if(outCount > parseInt(answers.length/2)){
      foundWordsDiv = document.getElementById("foundwords2");
      columnCount2++;
    } else {
      foundWordsDiv = document.getElementById("foundwords1");
      columnCount1++;
    }
  }
  if(columnCount2 == 0 ){
    foundWordsDiv = document.getElementById("foundwords2");
    foundWordsDiv.style.display = 'none';
  }
  if(columnCount1 == 0 ){
    foundWordsDiv = document.getElementById("foundwords1");
    foundWordsDiv.style.display = 'none';
  }
  if(wordsToShow.length > 0) {
    //foundWordsDiv.style.display = "block";
  }
}

function wordPoints(word) {
  let points = word.length;
  if(word.length == 4) {
    points = 1;
  } else if (isPanagram(word)) {
    points = points + 7;
  }
  return points;
}

function isPanagram(word){
  if(panagrams.indexOf(word.toLowerCase()) > -1){
    return true;
  }
  return false;
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
        //clickLetter(key.toUpperCase());
        let hexagon = document.getElementById('hexagon-' + key.toUpperCase());
        if(allowKeyboardInput) {
          hexagon.click();
          setTimeout(()=>{hexagon.style.backgroundColor = '#eeee99'}, 200);
        }
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



