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
$auth = gvfw("auth");
$data = gvfw("data");
$userData = gvfw("user_data");
$out = [];
$userId = decryptLongString($auth, $encryptionPassword);
$hash = md5($data);
$gameId = gvfw("game_id");
$gameTypeId = gvfw("game_type_id");
if(!is_numeric($userId)){
	$out = ["error"=> "Failed authentication"];
	die(json_encode($out));
}
$foundAGame = false;
if($_POST) {
	if ($action == "sendmessage") {
		$message = gvfw("message");
		$messagesRead = json_decode(gvfw("messages_read"));
		//var_dump($messagesRead);
		$destUserId = gvfw("dest_user_id");
		$sql = "INSERT INTO message (message, created, source_user_id, dest_user_id, game_id) VALUES ('" .  mysqli_real_escape_string($conn, $message) . "','" . $formatedDateTime . "'," . $userId . "," . $destUserId . "," . $gameId  .");";
		//die($sql);
		$result = mysqli_query($conn, $sql);
		$error = mysqli_error($conn);
		if(count($messagesRead) > 0){

			$sql = "UPDATE message SET has_been_read = 1 WHERE message_id IN (" . implode(",", $messagesRead ) . ")  AND dest_user_id=" . intval($userId);
			//echo $sql;
			$result = mysqli_query($conn, $sql);
			$error = mysqli_error($conn);
		}
	} else if($action == "savegame"){
		$latestWords = [];
		//var_dump($userData);
		$itemCount = 0;
		$score = 0;
		if($userData) {
			$userDataObject = json_decode($userData, true);
			$latestWords =  gvfa("found_words", $userDataObject);
			$itemCount = count($latestWords);
			$score = gvfa("score", $userDataObject);
			$premiumCount = gvfa("premium_count", $userDataObject);
			//die("score: " . $score);
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
					/* //this won't happen:
					if(array_key_exists("found_words", $settings)) {
						$foundWords = $settings["found_words"];
					}
					*/
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
							//echo $sql;
							$otherResult = mysqli_query($conn, $sql);
							$error = mysqli_error($conn);
						}
					}
					//echo $sql;
					$out = ["game_id"=> $row["game_id"] , "found_words" => $foundWords, "error" => $error];
				}
			}
		} 
		if(!$foundAGame){
			$sql = "INSERT into game(name, game_type_id, game_hash, description, settings, created, game_date) VALUES ('Spelling Bee " . $formatedDateTime . "', " . $gameTypeId . ",'" . $hash
				. "',NULL,'" . mysqli_real_escape_string($conn, $data) . "','" . $formatedDateTime . "','" . $formatedDateTime . "')";
			$result = mysqli_query($conn, $sql);
			//echo $sql;
			$error = mysqli_error($conn);
			//echo $error;
			$gameId = mysqli_insert_id($conn);

			//also need to save a user_game
			$sql = "INSERT into user_game(game_id, user_id, settings, item_count, score, premium_count, created, modified) 
			VALUES (" . $gameId . "," . $userId . ",'" . mysqli_real_escape_string($conn, $userData) . "'," . $itemCount . ",".  intval($score) . "," . intval($premiumCount) . ",'"  . $formatedDateTime . "','"  . $formatedDateTime . "');";
			$otherResult = mysqli_query($conn, $sql); 
			$error = mysqli_error($conn);

			$out = ["game_id"=> $gameId , "found_words" => $latestWords, "error" => $error];
		}
	}
	if($gameId  && $userId) {
		$sql = "SELECT score, item_count, premium_count, ug.user_id, email, modified FROM user_game ug JOIN user u ON ug.user_id=u.user_id WHERE game_id=" . intval($gameId) . " AND ug.user_id<>" . intval($userId);
		//die($sql);
		$gameResult = mysqli_query($conn, $sql);
		$otherGameRecords = mysqli_fetch_all($gameResult, MYSQLI_ASSOC);
		if($otherGameRecords && count($otherGameRecords)>0) {
			$out["other_scores"] = $otherGameRecords;
		}
		$sql = "SELECT message_id, message, m.created, source_user_id, email FROM message m JOIN user u ON m.dest_user_id=u.user_id WHERE has_been_read = 0 AND game_id=" . intval($gameId) . " AND u.user_id=" . intval($userId);
		//die($sql);
		$messageResult = mysqli_query($conn, $sql);
		$messageRecords = mysqli_fetch_all($messageResult, MYSQLI_ASSOC);
		if($messageRecords && count($messageRecords)>0) {
			$out["messages"] = $messageRecords;
		}  
	}
}
die(json_encode($out));
