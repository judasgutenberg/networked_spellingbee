<?php 
$line = date('Y-m-d H:i:s') . " - " . $_SERVER['REMOTE_ADDR'];
file_put_contents('visitors.log', $line . PHP_EOL, FILE_APPEND);
if(array_key_exists('HTTP_REFERER',  $_SERVER)) {
  $line = date('Y-m-d H:i:s') . " - " . $_SERVER['HTTP_REFERER'];
  file_put_contents('referer.log', $line . PHP_EOL, FILE_APPEND);
}
include("config.php");
include("site_functions.php");
$version = 1.36;
$conn = mysqli_connect($servername, $username, $password, $database);
$user = logIn();
$table = strtolower(filterStringForSqlEntities(gvfw('table', "user"))); 
$errors = "";
$content = "";
$action = gvfw("action");

if ($action == "login") {
	loginUser();
} else if ($action == "logout") {
	logOut();
	header("Location: ?action=login");
}
 
if(!$user) {
  if(beginswith(strtolower($action), "create")) {
    $errors = createUser();
    if($errors == ""){
      //die("ww");
      header("Location: ?action=login");
    }
  }
	if(gvfa("password", $_POST) != "") {
      $content .= "<div class='genericformerror'>The credentials you entered have failed.</div>";
    }
    if (($table == "user" || !is_null($errors)) && $action == "startcreate" ) {
      $content .= "<div class='header'>Creating an Account</div>";
      $content .= newUserForm($errors);
    }  
    if($action != "startcreate" && $action != "create user"){
      $content .= "<div class='info'>You can play complete games without an account.  Creating an account gives you more features.</div>";
      $content .= loginForm();
    }

} else {
  if($user) {
    $content .= "<div class='loggedin'>You are logged in as <b>" . $user["email"] . "</b>   <div class='basicbutton'><a href=\"?action=logout\">logout</a></div></div>\n";
    $encryptedUser = encryptLongString($user["user_id"], $encryptionPassword);
	}
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <script src='spellingbee.js?v=<?php echo $version?>'></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spelling Bee</title>
    <link rel='stylesheet' href='spellingbee.css?v=<?php echo $version?>'>
    <link rel="icon" type="image/x-icon" href="./favicon.ico" />
</head>
<body>
  <div class="centered-div" id="top-div">
    <div id="login" >
          <?php echo $content; ?>
    </div>
    <div id="message" ></div>
    <div id="yesterdayanswers"></div>
    <div id="links" >
      <a href='javascript:yesterday()'>yesterday's answers</a><br/>
      <a href='javascript:showLevels()'>show levels</a><br/>
      <a href='javascript:showStats()'>show your stats</a><br/>
      <a href='javascript:showHints()'>show hints</a><br/>
      <a href='javascript:showOthers()'>show others</a><br/>
      <?php if(gvfw("date") != "") { 
        
        echo "on " . gvfw("date") ." (<a style='color:red' href=.>x</a>)";
        } else { 
        echo "<a href='javascript:revisitPast()'>revisit old game</a>";
      }
      ?>
      <br/><br/> 
      <a href='https://github.com/judasgutenberg/networked_spellingbee' target='_new'>source code</a><br/>
    </div>
    <div id="levellist" class='tempwindow'></div>
    <div id="stats" class='tempwindow'></div>
    <div id="hints" class='tempwindow'></div>
    <div id="others" class='tempwindow'></div>
    <div id="foundwordslabel" >Words You Have Found</div>
    <div id="config"><input onchange='updateFoundWords()' type='checkbox' id='sortAlphabetically'/>sort alphabetically</div>
    <div id="foundwords" >
        <div id="foundwords1" ></div>
        <div id="foundwords2" ></div>
    </div>
    <div id="pastbrowser" class='tempwindow'></div>
    <div id="score" class='score'></div>
    <div id="currentword"></div>
    <div id="communicationmessage" ><script>document.write(closeDivButton())</script>
      <div id='receivedmessage' class='receivedmessage'></div>
      <form>
        <div>
          <textarea onfocus='allowKeyboardInput = 0' onblur='allowKeyboardInput = 1' id='sendmessage' style='width:280px;height:100px'></textarea>
          <button onclick='return(sendMessage())'>send</button>
        </div>
      </form>
    </div>
  </div>
  <div id="hexagon-container"></div>
    <div class="centered-div" id="top-div">
    <div class='buttons'>
      <button class='largebutton' data-key="Backspace" onclick='return(deleteLetter())' >delete</button>
      <button class='largebutton' data-key="Enter" onclick='return(enterWord())' >enter</button>
      <button class='largebutton' data-key=" " onclick='return(shuffle())' >shuffle</button>
    </div>
  <script>
    <?php 
      if($user){
        echo "let auth = '" . $encryptedUser . "';". PHP_EOL;
      } else {
        echo "let auth = '';". PHP_EOL;
      }
      ?>
  </script>
</body>
</html>