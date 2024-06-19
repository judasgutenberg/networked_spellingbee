# networked_spellingbee
This allows you to play the day's New York Times Spelling Bee without a New York Times account.  How is this possible?  All the information to play the game is on the "demo" page that NYT serves to people without accounts.  I take that data and spin up a game!

This version allows you to log in and continue play on a different machine. Other network features coming soon!

To get this working, you need to put all of this code on a server capable of serving PHP and connecting to a MySQL database.  Run game.sql on your MySQL server and set the values for your database in config.php.
To see this working in the real world, go here: http://randomsprocket.com/spellingbee 
There you can create a user or play the game without one.
