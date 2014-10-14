multiplayer-game-template
=========================

## Installation

Get client dependencies by running `bower install` in the `client` folder.

Get server dependencies by running `npm install` at the `root`.

Then, cd to the `server` folder and run `node server.js`.

## About

The goal of this project is to provide a template for browser-based realtime multiplayer games, relying on websockets with nodejs backend.

After finishing my [pokemon-map](https://github.com/Owumaro/pokemon-map) demo for browser-based realtime multiplayer game, I realized a few things :
* Feedback I received was really good. Pokemon was a reason of course, but the realtime MMO style in the browser also quite an impressive factor.
* It was really easy to "cheat" as a player and needed more brainstorming about security.
* The "Pokemon" part is really a small part of the code/time spent, nearly 5%
* The concept could be easily expanded to other games. We could imagine multiplayer platform games like Mario, a fighting game like Super smash bros., etc.

Because of the potential of this concept, I decided to create a template, in order to have a solid base for my next projects and (why not) other people's.

## Design choices

* No subscription/database. It's a template and can easily be extended to get this feature. However, I like to develop small games and to give people a try instantly. Moreover, it's already hard to find a nodejs host, let's get rid of databases.
* Room system. Some games are designed to be massively multiplayer (like in an open world), however this requires more work than just taking a template (but prove me I'm wrong).
  * By default, when creating a new room, the user will be asked to choose the maximum number of players in the room. But you can remove the feature and put a constant.
  * You can also extend the template to provide room options, like choosing a different map.
* Each room has its own chat. 
* By default, a room can also host viewers. They can see the game like players and chat, but can't interact with the game.
* As a template game, I created a 2d sandbox where players can go left/right and jump.
* All game mechanics are on the server-side. (see [GameMechanicsNotes.md](https://github.com/Owumaro/multiplayer-game-template/blob/master/GameMechanicsNotes.md), requires more thoughts)

That's it. Any comment/feedback is welcome, it's still a very early version and needs contributions to get interesting. Thanks !
