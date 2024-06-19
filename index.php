<?php 
include("config.php");
include("site_functions.php");

$conn = mysqli_connect($servername, $username, $password, $database);
$user = logIn();
$table = strtolower(filterStringForSqlEntities(gvfw('table', "device"))); 
$errors = "";
$content = "";
$action = gvfw("action");
if ($action == "login") {
	loginUser();
} else if ($action == "logout") {
	logOut();
	header("Location: ?action=login");
	die();
}
 
if(!$user) {
  //die(!$user . "+"  . $action  . "+" . intval(beginswith(strtolower($action), "create")))  ;
  if(beginswith(strtolower($action), "create")) {
    //echo "USER CREATED";
    $errors = createUser();
    //var_dump($errors);
    //die("what");
    if($errors == ""){
      //die("ww");
      header("Location: ?action=login");
    }
  }
	if(gvfa("password", $_POST) != "") {
		$content .= "<div class='genericformerror'>The credentials you entered have failed.</div>";
	}
  if (($table == "user" || !is_null($errors)) && $action == "startcreate" ) {
    
    $content .= newUserForm($errors);

  } else if(gvfa("password", $_POST) != "") {
   }
  if($action != "startcreate" && $action != "create user"){
    $content .= "<div class='info'>You can play complete games without being logged in.  But if you create an account, you can resume games on other devices.</div>";
    $content .= loginForm();
  }

} else {
  if($user) {
    $content .= "<div class='loggedin'>You are logged in as <b>" . $user["email"] . "</b><div class='basicbutton'><a href=\"?action=logout\">logout</a></div></div>\n";
    $encryptedUser = encryptLongString($user["user_id"], $encryptionPassword);
	}
	else
	{
    //$out .= "<div class='loggedin'>You are logged out.  </div>\n";
	} 

}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <script src='spellingbee.js'></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spelling Bee</title>
    <link rel='stylesheet' href='spellingbee.css'>
<body>

 <div class="centered-div" id="top-div">
    <div id="login" ><?php echo $content; ?></div>
    <div id="message" ></div>
    <div id="foundwordslabel" >Words You Have Found</div>
    <div id="config"><input onchange='updateFoundWords()' type='checkbox' id='sortAlphabetically'/>sort alphabetically</div>
    <div id="foundwords" ></div>
    <div id="score" style='border:1px solid #999999'></div>
    <div id="currentword"></div>
 </div>


<div id="hexagon-container"></div>
  <div class="centered-div" id="top-div">
  <div class='buttons'>
    <button data-key="Backspace" onclick='return(deleteLetter())' >delete</button>
    <button data-key="Enter" onclick='return(enterWord())' >enter</button>
    <button data-key=" " onclick='return(shuffle())' >shuffle</button>
  </div>
<script>
  const hexagonLetters = {};
  const buttonKeys = {};
  let currentWord = "";
  let foundWords = [];
  let score = 0;
  let level = "Nice Start";
  let totalScore = 0;
  let game_id = 0;
  let game_type_id = 1;
  <?php 
  $url = "https://www.nytimes.com/puzzles/spelling-bee/";
  $src = file_get_contents($url);

  function getValueBetween($haystack, $startStr, $endStr) {
      $startPos = strpos($haystack, $startStr);
      if ($startPos !== false) {
          $endPos = strpos($haystack, $endStr, $startPos + strlen($startStr));
          if ($endPos !== false) {
              return substr($haystack, $startPos + strlen($startStr), $endPos - $startPos - strlen($startStr));
          } else {
              return "";
          }
      } else {
          return "";
      }
  }
  if($user){
    echo "let auth = '" . $encryptedUser . "';". PHP_EOL;
  } else {
    echo "let auth = '';". PHP_EOL;

  }
  if (strlen($src) > 0) {
      $centerLetter = getValueBetween($src, '"centerLetter":"', '"');
      $outerLetters = getValueBetween($src, '"outerLetters":[', ']');
      $answers = getValueBetween($src, '"answers":[', ']');
      $panagrams = getValueBetween($src, '"pangrams":[', ']');
      echo "let answers = [" . $answers . "];" . PHP_EOL;
      echo "let panagrams = [" . $panagrams . "];" . PHP_EOL;
      echo "let centerLetter = \"" . $centerLetter . "\";" . PHP_EOL;
      echo "let outerLetters = [" . $outerLetters . "];" . PHP_EOL;
      echo "let letters = centerLetter + outerLetters.join(\"\") + \";\"" . PHP_EOL;
  }
  ?>

</script>
</body>
</html>