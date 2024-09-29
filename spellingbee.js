const hexagonLetters = {};
const buttonKeys = {};
let currentWord = "";
let foundWords = [];
let score = 0;
let level = "Nice Start";
let totalScore = 0;
let gameId = 0;
let userId = 0;
let gameTypeId = 1;
let panagramsFound = 0;
let destUserId = 0;
let allowKeyboardInput = 1;
let messagesRead = [];
let answers = [];
let panagrams = [];
let letters = [];
let centerLetter = "";
let outerLetters = [];
let levelValues = {"Queen Bee": 1, "Genius": 0.7, "Amazing": 0.5, "Great": 0.4, "Nice": 0.25, "Solid": 0.15, "Good": 0.08, "Moving Up": 0.05, "Good start": 0.02, "Beginner": 0}
let storedColor = "#ffffff";
let storedBgColor = "#ffffff";


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
      let usualBackgroundColor = '#eeee99';
      let mouseOverBackgroundColor = '#ff9900'
      let textColor = "#000000";
      let mouseOverTextColor = "#ffffff";
      if(i==6){
        usualBackgroundColor = '#ffffff';
        mouseOverBackgroundColor = '#ffff00'
        textColor = "#ff6666";
        mouseOverTextColor = "#000000";
      }
      hexagon.style.backgroundColor = usualBackgroundColor;
      hexagon.style.color = textColor;
      hexagon.addEventListener('mouseover', () => {
          hexagon.style.backgroundColor = mouseOverBackgroundColor;
          hexagon.style.color = mouseOverTextColor;
          hexagon.style.fontWeight = 'bold';
      });
      hexagon.addEventListener('mouseout', () => {
          hexagon.style.backgroundColor = usualBackgroundColor;
          hexagon.style.color = textColor;
          hexagon.style.fontWeight = 'bold';
      });
      hexagon.addEventListener('click', () => {
        storedBgColor = hexagon.style.backgroundColor;
        storedColor = hexagon.style.color;
        hexagon.style.backgroundColor = mouseOverBackgroundColor;
        hexagon.style.color = textColor;
        hexagon.style.fontWeight = 'bold';
    });
      container.appendChild(hexagon);
      hexagonLetters[randomLetter] = hexagon;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try{
    await getGameDataFromNYT();
    generateHexagons();
    setupButtons();
    calculateTotalPossibleScore();
    updateGameDatabase();
    
    document.addEventListener('keydown', handleKeyPress);
    stats(answers, "hints");
    
    pointLevels();
    updateGameDatabase(true);
  } catch (error){
    console.log("oops!");
  }
});

function calculateTotalPossibleScore() {
  for(let word of answers){
    totalScore += wordPoints(word);
  }
}

function deobfuscateWords(obfuscatedWords) {
  return obfuscatedWords.map(word => atob(word));
}


function deobfuscate(phrase) {
  return atob(phrase);
}

function getGameDataFromNYT() {
  return new Promise((resolve, reject) => {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === XMLHttpRequest.DONE) {
        if (xmlhttp.status === 200) {
          let data;
          try {
            data = JSON.parse(deobfuscate(xmlhttp.responseText));
          } catch (error) {
            return reject(error);
          }
          // Set the globals
          letters = data["letters"];
          centerLetter = data["centerLetter"][0];
          outerLetters = data["outerLetters"];
          panagrams = data["panagrams"];
          answers = data["answers"];
          resolve();  // Resolve the promise once data is set
        } else {
          reject(new Error(`Failed to fetch data: ${xmlhttp.statusText}`));
        }
      }
    };
    let url = "data.php";
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  });
}

function logPlay(wasValid){
  let xmlhttp = new XMLHttpRequest();
  // Check if the browser is online before making the request
  if (!navigator.onLine) {
    console.warn("No internet connection for word logging. Update aborted.");
    return;
  }
  const params = new URLSearchParams();
 
  params.append("auth", auth);
  params.append("game_type_id", gameTypeId);
  params.append("game_id", gameId);
  params.append("option_text", currentWord);
  if(wasValid) {
    params.append("was_valid", 1);
  } else {
    params.append("was_valid", 0);
  }
  
  params.append("action", "logplay");
 
  let url = "data.php"; 
  //console.log(url);
  xmlhttp.open("POST", url, true);
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlhttp.send(params);
}


function updateGameDatabase(justPoll){
  let nowDate = new Date(); 
  let time = nowDate.getTime();
  time = time - (time % 86400000);
  if(auth == ""){
    //if we don't have a user, then let's store the game in the browser
    if(foundWords.length < 1) {
      let jsonFoundWords = localStorage.getItem("foundWords" + time);
      if(jsonFoundWords != ""  && jsonFoundWords != null){
        //console.log(jsonFoundWords);
        foundWords = JSON.parse(jsonFoundWords);
        //updateFoundWords();
        //recalculateScore();
      }
    } else {
      localStorage.setItem("foundWords" + time, JSON.stringify(foundWords));
    }
    updateFoundWords();
    recalculateScore();
    stats(foundWords, "stats");
    stats(answers, "hints");
    return;
  }

  // Check if the browser is online before making the request
  if (!navigator.onLine) {
    console.warn("No internet connection. Update aborted.");
    return;
  }
  let foundWordsLocal = [];
  let foundWordsFromServer = [];

  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {

    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      //console.log(xmlhttp.responseText);
      let data = JSON.parse(xmlhttp.responseText);
      //set some globals
      if(data["user_id"]){
        userId = data["user_id"];
      }
      console.log(userId);
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
      foundWordsFromServer = data["found_words"];
      //console.log(foundWordsFromServer);
        
      if(!justPoll){
        let jsonFoundWords = localStorage.getItem("foundWords" + userId + "_" + gameId);
        if(jsonFoundWords != ""  && jsonFoundWords != null){
          //console.log(jsonFoundWords);
          foundWordsLocal = JSON.parse(jsonFoundWords);
          //updateFoundWords();
          //recalculateScore();
        }
        if(foundWordsLocal.length > foundWordsFromServer.length){
          foundWords = foundWordsLocal; 
        } else {
          foundWords = foundWordsFromServer;
        }
        console.log(foundWords);
        //console.log(foundWords);dd
        updateFoundWords();
        //console.log(otherScores);
        recalculateScore();
        stats(foundWords, "stats");
      }
      setTimeout(()=>{if(justPoll){updateGameDatabase(true);}},3000);//this makes the game poll the backend for messages and score changes in other games
    }
  }
  const params = new URLSearchParams();
  if(!justPoll){
    let data = {"answers": answers, "panagrams": panagrams, "centerLetter": centerLetter, "outerLetters": outerLetters};
    let userData = {"found_words": foundWords, "score": score, "premium_count": panagramsFound};
    if(foundWordsLocal.length <= foundWords.length) {
      localStorage.setItem("foundWords" + userId + "_" + gameId, JSON.stringify(foundWords));
    }
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
  updateCurrentWordDisplay();
}

function deleteLetter(letter){
  if(currentWord != "") {
    currentWord = currentWord.substring(0, currentWord.length-1);
    document.getElementById("currentword").innerHTML = currentWord;
    updateCurrentWordDisplay();
  }
  return false;
}

function updateCurrentWordDisplay(){
  let currentWordDiv = document.getElementById('currentword');
  if(currentWord== ""){
    currentWordDiv.style.display = 'none';
  } else {
    currentWordDiv.style.display = 'block';
  }

}

function enterWord(){
  if(currentWord == ""){
    return;
  }
  
  let panagramFound = false;
  let message = "";
  let delay = 2000;
  let color = "#ffff99";
  if(answers.indexOf(currentWord.toLowerCase()) > -1 && foundWords.indexOf(currentWord.toLowerCase()) ==-1){
    foundWords.push(currentWord.toLowerCase()); 
    let wordScore = wordPoints(currentWord);
    if(panagrams.indexOf(currentWord.toLowerCase()) > -1) {
      message = "You found a panagram! +" + wordScore + " points!";


      panagramFound = true;
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
    recalculateScore(panagramFound);
    updateGameDatabase();
    logPlay(true);
  } else if (message=esotericTests(currentWord)){
    color = '#ff6633';
    logPlay(false);
  } else if (currentWord.length < 4 && currentWord.toLowerCase().indexOf(centerLetter) == -1) {
    message = "Your " + randomAdjective() + " word was too " + randomAdjective() + " short and didn't contain a '" + centerLetter + "'!"
    color = '#ff9999';
    logPlay(false);
  } else if (currentWord.length < 4) {
    message = "Your " + randomAdjective() + " word was too short!";
    color = '#ff9999';
    logPlay(false);
  } else if (currentWord.toLowerCase().indexOf(centerLetter) == -1) {
    message = "Your word must contain '" + centerLetter + "'!";
    color = '#ff9999';
    logPlay(false);
  } else if (foundWords.indexOf(currentWord.toLowerCase()) > -1) {
    message = "You already found that " + randomAdjective() + " word!";
    color = '#ffcc99';
    logPlay(false);
  } else {
    message = "That's not a " + randomAdjective() + " word!";
    color = '#ff9999';
    logPlay(false)
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
  
  stats(foundWords, "stats");
  setTimeout(()=>{
    messageDiv.style.display = 'none';
    
  }, delay);
  return false;
}

function esotericTests(word){
  let tests = [
    {
    "error": "Are you drunk? No English word contains three of the same letter in a row!",
    "pattern": "([a-zA-Z])\\1\\1"
    },
    {
      "error": "Easy, partner, that's a lot of consonants in a row!",
      "pattern": "[^aeiou]{4,}"
      }
  ]
  for(let test of tests) {
    let testPattern = new RegExp(test["pattern"]);
    if(testPattern.test(word.toLowerCase())){
      return test["error"];
    }

  }
  return false;
}

function randomAdjective(){
  let words="fucking goddamn motherfucking real";
  let wordArray = words.split(" ");
  return wordArray[parseInt(Math.random() * wordArray.length)];
}

function recalculateScore(panagramFound) {
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
  let ordinal = 0;
  if(totalScore > 0 ) {
    let fraction = score/totalScore;
    ordinal = getLevelOrdinal(fraction); 
    console.log(fraction, ordinal);
    if(ordinal == 9) {
      queenBeeParty(10);
    }
    if (panagramFound){
      panagramParty(10, ordinal);
    }
    level = getLevel(fraction);
    
  }
  scoreDiv.innerHTML = "Score: " + score + " points; Level: " + level;
  scoreDiv.style.display = 'block';
  document.body.style.backgroundImage = "url('./bees/" + ordinal + ".jpg')";
}

function getLevelOrdinal(fraction) {
  let out = 9;
  for (const [key, value] of Object.entries(levelValues)) {
      if (fraction * 100 >= Math.floor(value * 100)) {
          return out;
      }
      out--;
  }
  return null; // In case no match is found, although with the provided levels, this should not happen
}


function getLevel(fraction) {
  for (const [key, value] of Object.entries(levelValues)) {
      if (fraction * 100 >= Math.floor(value * 100)) {
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
      out += "<div class='messageheader'>" + message["source_email"] + " <span class='messagetimedescription'>" + timeAgo(message["created"])  + "</span></div>\n";
      out += "<div class='messagetext'>" + message["message"] + "</div>\n";
      destUserId = message["source_user_id"]; //if you use the text box, it's to the person who last sent you a message
    }
  }
  document.getElementById("receivedmessage").innerHTML = out;

}

function otherFoundWords(userId) {
  if(auth == ""){
    alert("This feature only works for logged-in users.");
    return;
  }
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
  if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    let yesterdayAnswers = document.getElementById('yesterdayanswers');
    yesterdayAnswers.style.display = 'block';
    let data = JSON.parse(xmlhttp.responseText);
    let answers = data["answers"];
    let foundWords =  data["found_words"];
    let panagrams = data["panagrams"];
    yesterdayAnswers.innerHTML = "<div class='header'>"  + data["email"]; + "'s Game</div>";
    yesterdayAnswers.innerHTML += "<div class='header' style='text-decoration:underline'><i style='color:red'>" + data["centerLetter"]+ "</i>" + data["outerLetters"].join("") + "</div>";
    for(let word of answers){
      let pgIndicationBegin = "";
      let pgIndicationEnd = "";
      if(panagrams.indexOf(word) > -1){
        pgIndicationBegin = "<div class='panagram'>";
        pgIndicationEnd = "</div>";

      }
      if(foundWords.indexOf(word) > -1){
        yesterdayAnswers.innerHTML += "<div class='foundyesterday'>" + pgIndicationBegin +  word +  pgIndicationEnd + "</div>"; 
      } else {
        yesterdayAnswers.innerHTML += "<div class='notfoundyesterday'>" + pgIndicationBegin +  word +  pgIndicationEnd + "</div>";
      }

    }
    //console.log(data);
  }

}
  const params = new URLSearchParams();
  params.append("auth", auth);
  params.append("other_user_id", userId);
  params.append("game_type_id", gameTypeId);
  params.append("game_id", gameId);
  params.append("action", "getanswers");
  let url = "data.php"; 
  //console.log(url);
  xmlhttp.open("POST", url, true);
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlhttp.send(params);
}

function others(otherScores){
  let out = "<div class='header'>Others Playing This Game</div>\n";
  out += "<table class='otherscorestable'>\n";
  out += "<tr class='otherscoresheader'><th>who</th><th> score</th><th> word count</th><th>panagrams</th><th>level</th><th>last active</th><th>message</th></tr>\n";
  //console.log(otherScores, otherScores.length);
  for (let other of otherScores) {
    let fraction = other["score"]/totalScore;
    let level = getLevel(fraction);
    out += "<tr class='otherscores'><td>" + other["email"] + "</td>";
    out += "<td> " +  other["score"] +  "</td>";
    out += "<td>";
    if(totalScore/score  == 1) { //you only get this if you're a queen bee
      out += "<a class='basicbutton' href='javascript:otherFoundWords(" + other["user_id"] + ")'>";
    }
    out +=  other["item_count"] 
    if(totalScore/score  == 1) { //you only get this if you're a queen bee
      out += "</a>";
    }
    out += "</td>";
    out += "<td>" + other["premium_count"] + "</td>";
    out += "<td>" + level+ "</td><td>" + timeAgo(other["modified"]) + "</td>";
    out += "<td><a class='basicbutton' href='javascript:composeMessage(" + other["user_id"] + ")'>send</a></td>";
    
 
    out += "</tr>\n";
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

function showHints() {
  let hints = document.getElementById('hints');
  hints.style.display = 'block';
}

function showStats() {
  let hints = document.getElementById('stats');
  hints.style.display = 'block';
}

function showLevels() {
  let hints = document.getElementById('levellist');
  hints.style.display = 'block';
}

function showOthers() {
  let hints = document.getElementById('others');
  hints.style.display = 'block';
}

function yesterday() { //show the words you didn't get yesterday, assuming you played
  if(auth == ""){
    alert("This feature only works for logged-in users.");
    return;
  }
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      let yesterdayAnswers = document.getElementById('yesterdayanswers');
      yesterdayAnswers.style.display = 'block';
      let data = JSON.parse(xmlhttp.responseText);
      let answers = data["answers"];
      let foundWords =  data["found_words"];
      let panagrams = data["panagrams"];
      yesterdayAnswers.innerHTML = "<div class='header'>Yesterday's Game</div>";
      yesterdayAnswers.innerHTML += "<div class='header' style='text-decoration:underline'><i style='color:red'>" + data["centerLetter"]+ "</i>" + data["outerLetters"].join("") + "</div>";
      for(let word of answers){
        let pgIndicationBegin = "";
        let pgIndicationEnd = "";
        if(panagrams.indexOf(word) > -1){
          pgIndicationBegin = "<div class='panagram'>";
          pgIndicationEnd = "</div>";

        }
        if(foundWords.indexOf(word) > -1){
          yesterdayAnswers.innerHTML += "<div class='foundyesterday'>" + pgIndicationBegin +  word +  pgIndicationEnd + "</div>"; 
        } else {
          yesterdayAnswers.innerHTML += "<div class='notfoundyesterday'>" + pgIndicationBegin +  word +  pgIndicationEnd + "</div>";
        }

      }
      //console.log(data);
    }
  }
  const params = new URLSearchParams();
  params.append("auth", auth);
  params.append("game_type_id", gameTypeId);
  params.append("game_id", gameId -1);
  params.append("action", "getanswers");
  let url = "data.php"; 
  //console.log(url);
  xmlhttp.open("POST", url, true);
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlhttp.send(params);

}

function stats(wordList, div){
  let out = "<div class='header'>";
  if(div != "hints"){
    out += "Your Word Counts by Beginning Letter";
  } else {
    out += "Word Counts by Beginning Letter";
  }
  out += "</div>";
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
      let count = wordList
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
  out += "<td>" + wordList.length + "</td></tr>"
  header += "<td>&Sigma;</td></tr>";
  out = "<table>" + header + out + "</table>";
  let sortedWords = [...wordList]; 
  let pairs = sortedWords.sort()
    .filter(word => word.length >= 2) // Ensure words have at least 2 characters
    .map(word => word.substring(0, 2).toUpperCase()); 
  let uniquePairs = [...new Set(pairs)];
  noheader = true;
  let out2 = "<div class='header'>";
  if(div != "hints"){
    out2 += "Your Word Counts by Beginning Two Letters";
  } else {
    out2 += "Word Counts by Beginning Two Letters";
  }
  out2 += "</div>";
 
  let oldFirstLetter = "";
  for (const pair of uniquePairs) {
    let firstLetter = pair[0];
    if(oldFirstLetter!= firstLetter && oldFirstLetter != ""){
      out2 += "</div><div>" ;
    }
    out2 +=  "&nbsp;" + pair.toUpperCase();
      let count = wordList
        .filter(word => word.toLowerCase().startsWith(pair.toLowerCase()))
        .length;
      out2 += ":" + count ;

      oldFirstLetter = firstLetter;
  }
  out2 += "</div>";
  let panagramHintInfo = ""
  if(div == "hints"){
    panagramHintInfo = panagramHints();
  }
  document.getElementById(div).innerHTML = out + out2 + panagramHintInfo;
}

function shuffle(){
  generateHexagons();
  return false;
}

function updateFoundWords() {
  //it looks better if we put them in two columns
  let foundWordsDiv = document.getElementById("foundwords2");
  let sortAlphabetically = document.getElementById("sortAlphabetically").checked;
  foundWordsDiv.innerHTML = "";
  foundWordsDiv = document.getElementById("foundwords1");
  foundWordsDiv.innerHTML = "";
  let wordsToShow = [...foundWords];
  
  if(sortAlphabetically) {
    wordsToShow = wordsToShow.sort();
  }
  let outCount = 0;
  let columnCount1 = 0;
  let columnCount2 = 0;
  for(let word of wordsToShow){
    //console.log(word);
    outCount++;
    if(outCount > parseInt(answers.length/2)){
      foundWordsDiv = document.getElementById("foundwords2");
      columnCount2++;
    } else {
      foundWordsDiv = document.getElementById("foundwords1");
      columnCount1++;
    }
    if(isPanagram(word)) {
      foundWordsDiv.innerHTML+= "<div class='panagram'>" + word + "</div>";
    } else {
      foundWordsDiv.innerHTML+= "<div>" + word + "</div>";
    }
  }
  for(let i=1; i<3; i++) {
    foundWordsDiv = document.getElementById("foundwords" + i);
    if(foundWordsDiv.children.length==0){
      foundWordsDiv.style.display = 'none';
    } else {
      foundWordsDiv.style.display = 'block';
    }
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

function handleKeyPress(event) {
    const key = event.key;
    //console.log(key);
    if(key) {
      if (hexagonLetters[key.toUpperCase()]) {
          //clickLetter(key.toUpperCase());  
        let hexagon = document.getElementById('hexagon-' + key.toUpperCase());
        if(allowKeyboardInput) {
          storedBgColor = hexagon.style.backgroundColor;
          storedColor = hexagon.style.color;
          allowKeyboardInput = false;
          hexagon.click();
          setTimeout(()=>{allowKeyboardInput = true;hexagon.style.backgroundColor = storedBgColor; hexagon.style.color = storedColor;}, 40);
        }
      } else if (buttonKeys[key]) {
          buttonKeys[key].click();
      }
    }
    blurButtonsAndLinks();
}

function blurButtonsAndLinks() {
  const buttons = document.querySelectorAll('.buttons button, a');
  buttons.forEach(button => {
    button.blur();
  });
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

function panagramParty(timesLeft, ordinal){
  console.log(ordinal);
  if(timesLeft > 0){
    document.body.style.backgroundImage = "url('./bees/" + timesLeft + ".jpg')";
    document.body.style.backgroundColor = '#000000'
    setTimeout(()=>{panagramParty(timesLeft -1, ordinal)}, 100);
  } else {

    document.body.style.backgroundImage = "url('./bees/" + ordinal + ".jpg')";
  }
}

function queenBeeParty(timesLeft){
  if(timesLeft > 0){
    document.body.style.backgroundImage = "";
    if(timesLeft/2 == parseInt(timesLeft/2)) {
      document.body.style.backgroundColor = '#ff0000'
    } else {
      document.body.style.backgroundColor = '#000000'
    }
    setTimeout(()=>{queenBeeParty(timesLeft -1)}, 100);
  } else {
    document.body.style.backgroundImage = "url('./bees/9.jpg')";
  }
}

function formSubmitTasks() {
  if(onSubmitManyToManyItems){
    for(const item of onSubmitManyToManyItems){
      if(document.getElementById("dest_" + item)){
        for(const option of document.getElementById("dest_" + item).options) {
          //values.push(option.value);
          option.selected = true;
          console.log(option);
        }
      }
    }
  }
}

function panagramHints() {
  let out = "";
  out += "Panagrams: " + panagrams.length.toString();
  let perfect = 0;
  for(panagram of panagrams){
    if(panagram.length == 7) {
      perfect++;
    }
  }
  if(perfect > 0){
      out += " (" + perfect + " perfect)";
  }
  return out;
}

function startWaiting(message){
   
}

function stopWaiting(){
   
  
}