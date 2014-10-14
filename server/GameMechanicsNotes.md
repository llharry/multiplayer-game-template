Important notes about game implementation design
------------------------------------------------

You must implement your game logic on the server-side ! The client-side can always be altered.
See http://clay.io/blog/html5-game-development-tips-part-3/


I. Bad design :

1. User triggers an event (mouse, keys, whatever)
2. Client javascript updates the player state and the game display
3. Client javascript sends the new player state to the server
4. Server javascript broadcasts it to the other clients
5. Other clients receive the new player state and update the game display


II. Good design :

1. User triggers an event (mouse, keys, whatever)
2. Client javascript emits an associated event to the server
3. Server javascript applies the game mechanic
4. Server javascript broadcasts the new player state (if it actually changed) to everybody
5. All clients (including the emitter) receive the new player state and update the game display


This design is maybe too utopic, because it relies a lot on server/network performances. A better solution (for massive multiplayer online games/bad server) is to mix both of them :


III. Alternative ~good design :

1. User triggers an event (mouse, keys, whatever)
2. Client javascript emits an associate event to the server
3. Client javascript applies the game mechanic locally and updates the game display (-> no lag for the user)
4. Server javascript applies the game mechanic
5. Server javascript broadcasts the new player state (if it actually changed) to everybody
6. Other clients receive the new player state and update the game display

If the player cheats, it will work locally. But the others won't see it, and the server's game object will not be synchronized anymore with the cheater.
In some specific scenarios, the 'cheat' may be unintentionnal (example : bad network connection, the player's game is late and tries things that aren't possible after the events he missed). It could be interesting to add a mechanism to bring back this player to the current state.