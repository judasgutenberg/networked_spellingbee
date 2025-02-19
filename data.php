<?php 
//ajax backend for games
//june 19, 2024
//gus mueller
//////////////////////////////////////////////////////////////

//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

include("config.php");
include("site_functions.php");
$date = new DateTime("now", new DateTimeZone('America/New_York'));//obviously, you would use your timezone, not necessarily mine
$formatedDateTime =  $date->format('Y-m-d H:i:s');
$conn = mysqli_connect($servername, $username, $password, $database);
$action = gvfw("action");
$subAction = gvfw("subaction");
$auth = gvfw("auth");
$data = gvfw("data");
$userData = gvfw("user_data");
$out = [];
if($auth) {
	$userId = decryptLongString($auth, $encryptionPassword);
} else {
	$userId = 0;
}
$hash = md5($data);
$gameId = gvfw("game_id");
$gameTypeId = gvfw("game_type_id");
$foundAGame = false;
$otherUserId = gvfw("other_user_id");

if($_POST) {
	if ($action == "logplay") {
		if(!is_numeric($userId)){
			$userId = 0;
		}
		$optionText = gvfw("option_text");
		$optionId = intval(gvfw("option_id"));
		if(!$optionId) {
			$optionId = "NULL";
		}
		if(!$optionText) {
			$optionText = "NULL";
		} else {
			$optionText = "'" . mysqli_real_escape_string($conn,  $optionText) . "'";
		}
		$wasValid = gvfw("was_valid");
		$sql = "INSERT INTO play_log(user_id, game_id, option_text, option_id, was_valid, recorded) VALUES(" . intval($userId) . "," . intval($gameId) . "," .  $optionText . "," .$optionId . "," . intval($wasValid) . ",'" . $formatedDateTime . "')";
		$result = mysqli_query($conn, $sql);
		$error = mysqli_error($conn);
		$out["error"] = $error;
	}
	if(!is_numeric($userId)){
		$out = ["error"=> "Failed authentication"];
	} else {
		if ($action == "sendmessage") {
			$message = gvfw("message");
			$messagesRead = json_decode(gvfw("messages_read"));
			$destUserId = gvfw("dest_user_id");
			$sql = "INSERT INTO message (message, created, source_user_id, dest_user_id, game_id) VALUES ('" .  mysqli_real_escape_string($conn, $message) . "','" . $formatedDateTime . "'," . $userId . "," . $destUserId . "," . $gameId  .");";
			$result = mysqli_query($conn, $sql);
			$error = mysqli_error($conn);
			if(count($messagesRead) > 0){

				$sql = "UPDATE message SET has_been_read = 1 WHERE message_id IN (" . implode(",", $messagesRead ) . ")  AND dest_user_id=" . intval($userId);
				$result = mysqli_query($conn, $sql);
				$error = mysqli_error($conn);
			}
		} else if($action == "savegame"){
			$latestWords = [];
			$itemCount = 0;
			$score = 0;
			if($userData) {
				$userDataObject = json_decode($userData, true);
				$latestWords =  gvfa("found_words", $userDataObject);
				$itemCount = count($latestWords);
				$score = gvfa("score", $userDataObject);
				$premiumCount = gvfa("premium_count", $userDataObject);
			}
			//i distinguish individual games by taking a hash of their data
			$sql = "SELECT * FROM game WHERE game_hash = '" . mysqli_real_escape_string($conn,$hash) . "' AND game_type_id=" . intval($gameTypeId) . ";";
			//die($sql);
			$result = mysqli_query($conn, $sql);
			if($result) {
				$rows = mysqli_fetch_all($result, MYSQLI_ASSOC);
				if(count($rows) > 0) {
					$row = $rows[0];
					$foundAGame = true;
					$foundWords = [];
					if($row) {
						$settings = json_decode($row["settings"], true);
						$gameId = $row["game_id"];
						$sql = "SELECT * FROM user_game WHERE user_id = " . intval($userId) . " AND game_id= " . intval($gameId);
						//die($sql);
						$userResult = mysqli_query($conn, $sql);
						$error = mysqli_error($conn);
						if($userResult) {
							$userGameRows = mysqli_fetch_all($userResult, MYSQLI_ASSOC);
							if($userGameRows && count($userGameRows) > 0){
								$userGameRow = $userGameRows[0];
								$foundUserSettings = json_decode($userGameRow["settings"], true);
								
								if(array_key_exists("found_words", $foundUserSettings)) {
									if(count($latestWords) > 0){
										$foundWords = $latestWords;
									} else {
										$foundWords = $foundUserSettings["found_words"];
									}
								}
							}
						}
						if(!($userResult) || count($userGameRows)<1){
							
							$sql = "INSERT into user_game(game_id, user_id, settings, item_count, score, premium_count, created, modified) 
									VALUES (" . $gameId . "," . $userId . ",'" . mysqli_real_escape_string($conn, $userData) . "'," . $itemCount . ",".  intval($score) . "," . intval($premiumCount) . ",'"  . $formatedDateTime . "','"  . $formatedDateTime . "');";
							$otherResult = mysqli_query($conn, $sql); 
							$error = mysqli_error($conn);

						} else {
							if(count($latestWords) > 0) {
								$sql = "UPDATE user_game SET settings = '" . mysqli_real_escape_string($conn, $userData) . "', modified ='" . $formatedDateTime . "', score = " . intval($score) . ", premium_count = " . intval($premiumCount) . ", item_count=" . intval($itemCount) . "
										WHERE user_id=" . intval($userId) . " AND game_id= " . intval($gameId);
								$otherResult = mysqli_query($conn, $sql);
								$error = mysqli_error($conn);
							}
						}
						$out = ["user_id" => $userId, "game_id"=> $row["game_id"] , "found_words" => $foundWords, "error" => $error];
					}
				}
			} 
			if(!$foundAGame){
				$sql = "INSERT into game(name, game_type_id, game_hash, description, settings, created, game_date) VALUES ('Spelling Bee " . $formatedDateTime . "', " . $gameTypeId . ",'" . $hash
					. "',NULL,'" . mysqli_real_escape_string($conn, $data) . "','" . $formatedDateTime . "','" . $formatedDateTime . "')";
				$result = mysqli_query($conn, $sql);
				$error = mysqli_error($conn);
				$gameId = mysqli_insert_id($conn);
				//also need to save a user_game
				$sql = "INSERT into user_game(game_id, user_id, settings, item_count, score, premium_count, created, modified) 
				VALUES (" . $gameId . "," . $userId . ",'" . mysqli_real_escape_string($conn, $userData) . "'," . $itemCount . ",".  intval($score) . "," . intval($premiumCount) . ",'"  . $formatedDateTime . "','"  . $formatedDateTime . "');";
				$otherResult = mysqli_query($conn, $sql); 
				$error = mysqli_error($conn);

				$out = ["user_id" => $userId, "game_id"=> $gameId , "found_words" => $latestWords, "error" => $error];
			}
		}
		$answers = [];
		$panagrams = [];
		$centerLetter = [];
		$outerLetters = [];
		if($action == "getanswers") {
			if($subAction == "previous") {
				$sql = "SELECT * FROM game WHERE game_id < " . intval($gameId) . " LIMIT 0, 1"; //get the previous game
			} else {
				$sql = "SELECT * FROM game WHERE game_id = " . intval($gameId);
			}
			$gameResult = mysqli_query($conn, $sql);
			$error = mysqli_error($conn);
			$gameRecords = mysqli_fetch_all($gameResult, MYSQLI_ASSOC);
			$email = "unknownuser";
			if($gameRecords && count($gameRecords)>0) {
				$gameRecord = $gameRecords[0];
				$settings = json_decode($gameRecord["settings"], true);
				if($settings){
					$answers = $settings["answers"];
					$panagrams = $settings["panagrams"];
					$centerLetter = $settings["centerLetter"];
					$outerLetters = $settings["outerLetters"];
				}
			}
			if($otherUserId > 0) {
        $sql = "SELECT * FROM user WHERE  user_id = " . intval($otherUserId);
        $userResult = mysqli_query($conn, $sql);
        $error = mysqli_error($conn);
        $userRecords = mysqli_fetch_all($userResult, MYSQLI_ASSOC);
        if($userRecords && count($userRecords)>0) {
          $userRecord = $userRecords[0];
          $email = $userRecord ["email"];
				}
        
        $sql = "SELECT * FROM user_game WHERE game_id = " . intval($gameId) . " AND user_id = " . intval($otherUserId);
        
			} else {
        $sql = "SELECT * FROM user_game WHERE game_id = " . intval($gameId) . " AND user_id = " . intval($userId);
			}
			
			$userResult = mysqli_query($conn, $sql);
			$error = mysqli_error($conn);
			$userRecords = mysqli_fetch_all($userResult, MYSQLI_ASSOC);
			if($userRecords && count($userRecords)>0) {
				$userRecord = $userRecords[0];
				$score = $userRecord["score"];
				$itemCount = $userRecord["item_count"];
				$premiumCount = $userRecord["premium_count"];
				$userSettings = json_decode($userRecord["settings"], true);
				$foundWords = $userSettings["found_words"];
				$out =  ["email" => $email, "game_id"=> $gameId , "found_words" => $foundWords, "score"=>$score, 
					"answers"=> $answers, "panagrams"=> $panagrams, "centerLetter" => $centerLetter, "outerLetters" => $outerLetters,
					"item_count"=>$itemCount, "premium_count"=> $premiumCount, "error" => $error
				];
			}
		} else if($gameId  && $userId) {
			$sql = "SELECT score, item_count, premium_count, ug.user_id, email, modified FROM user_game ug JOIN user u ON ug.user_id=u.user_id WHERE game_id=" . intval($gameId) . " AND ug.user_id<>" . intval($userId);
			//die($sql);
			$gameResult = mysqli_query($conn, $sql);
			$otherGameRecords = mysqli_fetch_all($gameResult, MYSQLI_ASSOC);
			if($otherGameRecords && count($otherGameRecords)>0) {
				$out["other_scores"] = $otherGameRecords;
			}
			$sql = "SELECT message_id, message, m.created, m.source_user_id, u.email as dest_email, u2.email as source_email FROM message m JOIN user u ON m.dest_user_id=u.user_id JOIN user u2 ON m.source_user_id=u2.user_id WHERE has_been_read = 0 AND game_id=" . intval($gameId) . " AND dest_user_id=" . intval($userId);
			$messageResult = mysqli_query($conn, $sql);
			$messageRecords = mysqli_fetch_all($messageResult, MYSQLI_ASSOC);
			if($messageRecords && count($messageRecords)>0) {
				$out["messages"] = $messageRecords;
			}  
		}
	} 
} else { //otherwise just give me the day's data from the New Yawk Times or get data from an earlier game
	if(gvfa('date', $_REQUEST) !=""){
		$sql = "SELECT * FROM game WHERE game_date > '" . gvfw('date') . "' AND game_date< DATE_ADD('" . gvfw('date') . "', INTERVAL 1 DAY) AND game_type_id=" . $gameTypeId ;
		$result = mysqli_query($conn, $sql);
		$gameData = mysqli_fetch_array($result);
		$out = json_decode($gameData["settings"]);
	} else {
		$url = "https://www.nytimes.com/puzzles/spelling-bee/";
		$src = getCachedContent($url, "cache.txt");
		if (strlen($src) > 0) {
			$centerLetter = getValueBetween($src, '"centerLetter":"', '"');
			$outerLetters = getValueBetween($src, '"outerLetters":[', ']');
			$answers = getValueBetween($src, '"answers":[', ']');
			$panagrams = getValueBetween($src, '"pangrams":[', ']');
			$out = [
				"letters" => $centerLetter . implode("", str_getcsv($outerLetters)),
				"outerLetters" => str_getcsv($outerLetters),
				"centerLetter" => str_getcsv($centerLetter),
				"answers" => str_getcsv($answers),
				"panagrams" => str_getcsv($panagrams)
			];
		}
	}
	die(base64_encode(json_encode($out)));
}
die(json_encode($out));

function obfuscateWords($words) {
    $obfuscatedWords = array_map('base64_encode', $words);
    return $obfuscatedWords;
}

function getCachedContent($url, $cacheFile) {
	// Get current time and today's date at 4:00 AM
	$currentTime = time();
	$earlyToday = strtotime('today 8:00 AM');
	// If it's already past 4:00 AM today, use that timestamp; otherwise, use 4:00 AM yesterday
	if ($currentTime < $earlyToday) {
		$earlyToday = strtotime('yesterday 8:00 AM');
	}
	// Check if cache file exists and was modified after 4:00 AM today
	if (file_exists($cacheFile) && filemtime($cacheFile) > $earlyToday) {
		return file_get_contents($cacheFile);
	} else {
		$content = file_get_contents($url);
		file_put_contents($cacheFile, $content);
		return $content;
	}
}

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