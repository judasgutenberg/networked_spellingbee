<?php 
//generic php library, pruned down to just what is needed, August 9 2024 gus mueller

function doesUserHaveRole($user, $role) {
  if($role == "") {
    return true;
  }
  if(array_key_exists("role", $user)){
    if(gvfa("role", $user) == $role || strtolower(gvfa("role", $user)) == "admin" ) {
      return true;
    }
  }
  return false;
}
 
function logIn() {
  Global $encryptionPassword;
  Global $cookiename;
  if(!isset($_COOKIE[$cookiename])) {
    return false;
  } else {
   $cookieValue = $_COOKIE[$cookiename];
   $email = openssl_decrypt($cookieValue, "AES-128-CTR", $encryptionPassword);
   if(strpos($email, "@") > 0){
      return getUser($email);
   } else {
      return  false;
   }
  }
}
 
function logOut() {
  Global $cookiename;
  setcookie($cookiename, "");
  return false;
}
 
function loginForm() {
  $out = "";
  $out .= "<div class='userform'><form method='post' name='loginform' id='loginform'>\n";
  $out .= "<strong>Login here:</strong>  email: <input name='email' type='text'>\n";
  $out .= "password: <input name='password' type='password' style='width:100px'>\n";
  $out .= "<button name='action' value='login' type='submit'>login</button>\n";
  $out .= "<div style='margin-top:6px'> or  <div class='basicbutton'><a href=\"?table=user&action=startcreate\">create account</a></div></div>\n";
  $out .= "</form></div>\n";
  return $out;
}
 
function newUserForm($error = NULL) {
  $formData = array(
    [
      'label' => 'email',
      'name' => 'email',
      'width' => 100,
      'value' => gvfa("email", $_POST), 
      'error' => gvfa('email', $error)
    ],
    [
      'title' => 'password',
      'name' => 'password',
      'type' => 'password',
      'width' => 100,
      'value' => gvfa("password", $_POST), 
      'error' => gvfa('error', $error)
    ],
    [
      'label' => 'password (again)',
      'name' => 'password2',
      'type' => 'password',
      'width' => 100,
      'value' => gvfa("password2", $_POST),
      'error' => gvfa('password2', $error)
    ]
  );
  $out = genericForm($formData, "create user");
  $out.= "<div style='padding-top:10px;text-align:right'><a class='basicbutton' href='?action=login'>return to login</a></div>";
  return $out;
}

function genericForm($data, $submitLabel, $waitingMesasage = "Saving...") { //$data also includes any errors
  Global $conn;
	$out = "";
  $onSubmitManyToManyItems = [];
	$out .= "<div class='genericform'>\n";
  $columnCount = 0;
	foreach($data as &$datum) {
		$label = gvfa("label", $datum);
		$value = str_replace("\\\\", "\\", gvfa("value", $datum)); 
		$name = gvfa("name", $datum); 
		$type = strtolower(gvfa("type", $datum)); 
    $width = 200;
    if(endsWith($name, "_id") && $columnCount == 0  && ($type == "" || $type == "number")) { //make first column read-only if it's an _id
      $type = "read_only";
    }
    if(gvfa("width", $datum)){
      $width = gvfa("width", $datum);
    }
    $height = '';
    if(gvfa("height", $datum)){
      $height = gvfa("height", $datum);
    }
    $values =gvfa("values", $datum); 
		$error = gvfa("error", $datum); 
		if($label == "") {
			$label = $name;
		}
		if($type == "") {
			$type = "text";
		}
    $idString = "";
		if($type == "file") {
			$idString = "id='file'";
      $waitingMesasage = "Uploading...";
		}
		if($type == "hidden") {
      $out .= "<input name='" . $name . "' value=\"" .  ($value) . "\" type='" . $type . "'/>";
		} else {
      $out .= "<div class='genericformelementlabel'>" . $label . ": </div>";
      $out .= "<div class='genericformelementinput'>";
      $out .= "<div class='genericformerror'>" . $error . "</div>";
      $template = gvfa("template", $datum);
      if($type == 'json') {
        if($value) {
          $out .= generateSubFormFromJson($name, $value, $template);
        } else {
          $out .= generateSubFormFromJson($name, $template, $template);
        }
      } else if ($type == "bool" || $type == "checkbox"){
        $checked = "";
          if($value) {

            $checked = "checked";
          }
        $out .= "<input value='1' name='" . $name . "'  " . $checked . " type='checkbox'/>\n";
      } else if ($type == "read_only"){
        $out .= $value . "\n";
      } else {
        if($height){
          $out .= "<textarea " .  $idString . " style='width:" . $width . "px;height:" . $height . "px' name='" . $name . "'  />" .  $value  . "</textarea>\n";
        } else {
          $out .= "<input style='width:" . $width . "px'  " . $idString. " name='" . $name . "' value=\"" .  $value . "\" type='" . $type . "'/>\n";
        }
      }
      $out .= "</div>\n";
    }
    $columnCount++;
	}
	$out .= "<div class='genericformelementlabel'><input class='basicbutton' type='submit' name='action' id='action' value='" . $submitLabel . "'/></div>\n";
  $out .= "<input  name='_data' value=\"" . htmlspecialchars(json_encode($data)) . "\" type='hidden'/>";
	$out .= "</div>\n";
	$out .= "</form>\n";
  $out = "<form name='genericForm' onsubmit='formSubmitTasks();startWaiting(\"" . $waitingMesasage . "\")' method='post' name='genericform' id='genericform' enctype='multipart/form-data'>\n" . $out;
	return $out;
}

function getUser($email) {
  Global $conn;
  $sql = "SELECT * FROM `user` WHERE email = '" . mysqli_real_escape_string($conn, $email) . "'";
  $result = mysqli_query($conn, $sql);
  $row = $result->fetch_assoc();
  return $row;
}

function loginUser($source = NULL) {
  Global $conn;
  Global $encryptionPassword;
  Global $cookiename;
  if($source == NULL) {
  	$source = $_REQUEST;
  }
  $email = gvfa("email", $source);
  $passwordIn = gvfa("password", $source);
  $sql = "SELECT `email`, `password` FROM `user` WHERE email = '" . mysqli_real_escape_string($conn, $email) . "' ";
  $result = mysqli_query($conn, $sql);
  if(!$result){
    header("location: .");
    die();
  }

  $row = $result->fetch_assoc();
  if($row  && $row["email"] && $row["password"]) {
    $email = $row["email"];
    $passwordHashed = $row["password"];
    if (password_verify($passwordIn, $passwordHashed)) {
        setcookie($cookiename, openssl_encrypt($email, "AES-128-CTR", $encryptionPassword), time() + (30 * 365 * 24 * 60 * 60));
        header('Location: '.$_SERVER['PHP_SELF']);
        die();
    }
  }
  return false;
}

function gvfw($name, $fail = false){ //get value from wherever
  $out = gvfa($name, $_REQUEST, $fail);
  if($out == "") {
    $out = gvfa($name, $_POST, $fail);
  }
  return $out;
}

function gvfa($name, $source, $fail = false){ //get value from associative
  if(isset($source[$name])) {
    return $source[$name];
  }
  return $fail;
}

function beginsWith($strIn, $what) {
	if (substr($strIn,0, strlen($what))==$what){
		return true;
	}
	return false;
}

function endsWith($strIn, $what) {
	if (substr($strIn, strlen($strIn)- strlen($what) , strlen($what))==$what) {
		return true;
	}
	return false;
}

function createUser(){
  Global $conn;
  Global $encryptionPassword;
  $errors = NULL;
  $date = new DateTime("now", new DateTimeZone('America/New_York'));//obviously, you would use your timezone, not necessarily mine
  $formatedDateTime =  $date->format('Y-m-d H:i:s'); 
  $password = gvfa("password", $_POST);
  $password2 = gvfa("password2", $_POST);
  $email = gvfa("email", $_POST);
  if($password != $password2 || $password == "") {
  	$errors["password2"] = "Passwords must be identical and have a value";
  }
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
	  $errors["email"] = "Invalid email format";
  }
  if(is_null($errors)) {
  	$encryptedPassword =  crypt($password, $encryptionPassword);
    $userList = userList();
    if(count(userList()) == 0) {
      //if there are no users, create the first one as admin
      $sql = "INSERT INTO user(email, password, created, role) VALUES ('" . $email . "','" .  mysqli_real_escape_string($conn, $encryptedPassword) . "','" .$formatedDateTime . "','admin')"; 
    } else {
  	  $sql = "INSERT INTO user(email, password, created) VALUES ('" . $email . "','" .  mysqli_real_escape_string($conn, $encryptedPassword) . "','" .$formatedDateTime . "')"; 
    }
    $result = mysqli_query($conn, $sql);
    $id = mysqli_insert_id($conn);
    loginUser($_POST);
    header("Location: ?");
  } else {
  	return $errors;
  }
  return false;
}

function userList(){
  Global $conn;
  $userSql = "SELECT * FROM user";
  $thisDataResult = mysqli_query($conn, $userSql);
  if($thisDataResult) {
    $rows = mysqli_fetch_all($thisDataResult, MYSQLI_ASSOC);
  } else {
    $rows = [];
  }
  return $rows;
}

function encryptLongString($plaintext, $password) {
  $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
  $ciphertext = openssl_encrypt($plaintext, 'aes-256-cbc', $password, 0, $iv);
  $iv = str_pad($iv, 16, "\0");
  $ivBase64 = base64_encode($iv);
  $ciphertextBase64 = base64_encode($ciphertext);
  return $ivBase64 . ':' . $ciphertextBase64;
}

function decryptLongString($encryptedData, $password) {
  // Split the IV and ciphertext from the encrypted data
  list($ivBase64, $ciphertextBase64) = explode(':', $encryptedData, 2);
  $iv = base64_decode($ivBase64);
  $ciphertext = base64_decode($ciphertextBase64);
  $iv = str_pad($iv, 16, "\0");
  $plaintext = openssl_decrypt($ciphertext, 'aes-256-cbc', $password, 0, $iv);
  return $plaintext;
}

function filterStringForSqlEntities($input) {
  // Replace characters that are not letters, numbers, dashes, or underscores with an empty string
  $filtered = preg_replace('/[^a-zA-Z0-9-_]/', '', $input);
  return $filtered;
}