# networked_spellingbee
This open source Spelling Bee allows you to play the day's actual New York Times Spelling Bee without a New York Times account.  How is this possible?  All the information to play the game is on the "demo" page that NYT serves to people without accounts.  I take that data and spin up a game!


This version allows you to log in, see the progress of others playing the same installation of the game, and continue play on a different machine. 


![alt text](spellingbee_screengrab.jpg?raw=true)


To get this working, you need to put all of this code on a server capable of serving PHP and connecting to a MySQL database.  Run game.sql on your MySQL server and set the values for your database in config.php. 
To see this working in the real world (which is much easier than installing it on a sever, though this version is extremely easy to install on a server), go here: http://randomsprocket.com/spellingbee. 


There you can create a user (there's no email confirmation!) or play the game without one.  If you play without creating a login, it saves your game state in your browser so it can resume if the page is refreshed or you close the window and then come back.  Without a login, though, you cannot see yesterday's answers, see the state of other players' games, or send messages.  Bonus!  If you make it to Queen Bee (that is, you find all the words) then you get to see what words the other players have found so far.


The game includes the state of play you've reached in the two grids on the New York Times "hints" page (and it can show those hints as well if you choose to see them), helping you quickly zero in on the traits of the words remaining (if you like to "cheat" that way). To make such cheating as easy as possible, in the grids of your stats, numbers for word groups you haven't found all the words of are colored red. To add some visual interest, there are large images of various bees with flowers in the background that change with every change of level while playing the game (sort of like in the classic version of Tetris).  There are also some seizure-inducing visuals when you achieve particularly notable things.


If others are playing the same game as you are and you are both logged in, you can see their live scores and even send them messages (a feature that doesn't turn out to be very popular).  

If you've played games in the past and want to return to them to keep playing, you can navigate to them by clicking "see past games" in the navigation. It presents a calendar interface.  Once you are on a historic game, you can see the state of other people who played the game on that day as well.


As with my "Simple Spelling Bee" repo, this code uses no frameworks or Javascript libraries. I do have my own single-file PHP library I use for things, which I pared down to the minimum necessary to get the user creation and login system working.


Because my wife Gretchen and I kept seeing an extra "a" that wasn't there in "pangram," I have used the term "panagram" for that concept in this version of the game.


Note: this version caches data from the New York Times to a file, so you might encounter permission problems that will cause the page not to render. If so, liberalize the write permissions in the directory this code is served from. Or alter the path of the cached file and liberalize the permissions that points to.

# Known Bugs #
1. The calculation of what level you've reached is occasionally off by one, so you might linger too long in a level or get out of it prematurely under some circumstances.  I've had trouble tracking down the source of this issue, but it's probably a case of using round() instead of floor().
2. Some of the comments you get when you attempt to play a non-word or word you've already played do not make grammatical sense or are inappropriate for the context.  At this point I kind of like the awkwardness, which reminds me of poorly-translated Japanese videogames.
3. Games with very large numbers of words can cause the found word list to expand into the area occupied by the "Others Playing" window.  I've made such windows draggable to help with this situation.
4. Games featuring especially long words can cause the stats grids to burst out of the "Your Stats" and "Hints" windows.
