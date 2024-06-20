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
	if($action == "savegame"){
		$latestWords = [];
		//var_dump($userData);
		if($userData) {
			$latestWords = json_decode($userData, true)["found_words"];
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
						
						$sql = "INSERT into user_game(game_id, user_id, settings, created) 
								VALUES (" . $gameId . "," . $userId . ",'" . mysqli_real_escape_string($conn, $userData) . "','"  . $formatedDateTime . "');";
						$otherResult = mysqli_query($conn, $sql);
						$error = mysqli_error($conn);

					} else {
						if(count($latestWords) > 0) {
							$sql = "UPDATE user_game SET settings = '" . mysqli_real_escape_string($conn, $userData) . "' 
									WHERE user_id=" . intval($userId) . " AND game_id= " . intval($gameId);
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

			$out = ["game_id"=> $gameId , "found_words" => [], "error" => $error];
		}
	}
}
die(json_encode($out));
