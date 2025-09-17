 
CREATE TABLE user(
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NULL,
  full_name VARCHAR(200) NULL,
  sort_name VARCHAR(200) NULL,
  role VARCHAR(100) NULL,
  password VARCHAR(100) NULL,
  expired DATETIME NULL,
  preferences TEXT NULL,
  reset_password_token VARCHAR(30) NULL,
  created DATETIME
);

CREATE TABLE game_type(
  game_type_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NULL,
  description VARCHAR(2000) NULL,
  preferences TEXT NULL,
  created DATETIME
);

CREATE TABLE game(
  game_id INT AUTO_INCREMENT PRIMARY KEY,
  game_date DATETIME NULL,
  name VARCHAR(100) NULL,
  game_type_id INT NULL,
  game_hash VARCHAR(100) NULL,
  description VARCHAR(2000) NULL,
  settings TEXT NULL,
  created DATETIME
);

CREATE TABLE user_game(
  game_id INT,
  user_id INT,
  settings TEXT NULL,
  score INT NULL,
  item_count INT NULL,
  premium_count INT NULL,
  created DATETIME,
  modified DATETIME
);
  
CREATE TABLE message(
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  source_user_id INT,
  dest_user_id INT,
  game_id INT NULL,
  message TEXT NULL,
  has_been_read TINYINT DEFAULT 0,
  created DATETIME
);
 

 CREATE TABLE play_log(
  play_log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  game_id INT,
  option_text VARCHAR(50) NULL,
  option_id INT NULL,
  was_valid TINYINT DEFAULT 0,
  recorded DATETIME
);
 
 
   
 
