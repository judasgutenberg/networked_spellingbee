# networked_spellingbee
This open source Spelling Bee allows you to play the day's New York Times Spelling Bee without a New York Times account.  How is this possible?  All the information to play the game is on the "demo" page that NYT serves to people without accounts.  I take that data and spin up a game!

This version allows you to log in and continue play on a different machine. Other network features coming soon!

![alt text](spellingbee_screengrab.jpg?raw=true)

To get this working, you need to put all of this code on a server capable of serving PHP and connecting to a MySQL database.  Run game.sql on your MySQL server and set the values for your database in config.php.
To see this working in the real world, go here: http://randomsprocket.com/spellingbee. 

There you can create a user or play the game without one.

If others are playing the same game as you are and you are both logged in, you can see their live scores and even send them messages.  

Note: this version caches data from the NYT to a file, so you might encounter permission problems that will cause the page not to render. If so, liberalize the write permissions in the directory this code is served from. Or alter the path of cached file and liberalize the permissions that points to.
