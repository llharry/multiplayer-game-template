angular
  .module('multiControllers', [])

  .controller('HomeCtrl', ['$scope', '$http',
    function ($scope, $http) {
      // tell the server you're on #/
      socket.emit('home');
      
      // socket events
      socket.removeAllListeners();
      
      socket.on('rooms', function(data) {
        $scope.rooms = data;
        $scope.$apply();
      });
      
      socket.on('room', function(data) {
        $scope.$apply();
      });
      
      socket.on('create error roomname unavailable', function() {
        $scope.createForm.error = 'roomname unavailable';
        $scope.$apply();
      });
      
      socket.on('join error username unavailable', function() {
        $scope.joinForm.error = 'username unavailable';
        $scope.$apply();
      });
      
      socket.on('game', function() {
        location.href = '#/game';
      });
      
      // scope init
      $scope.joinForm = {
        username: '',
        error: ''
      };

      $scope.createForm = {
        username: '',
        roomname: '',
        roomsize: '2',
        error: ''
      };

      $scope.rooms;

      $scope.join = function(roomname, role) {
        // check if username is empty
        if ($scope.joinForm.username === '') {
          $scope.joinForm.error = 'username empty';
        } else {
          $scope.joinForm.error = '';
          
          socket.emit('join room', { username: $scope.joinForm.username, roomname : roomname, role: role });
        }
      };

      $scope.createAndJoin = function() {
        // check if username is empty
        if ($scope.createForm.username === '') {
          $scope.createForm.error = 'username empty';
        } else if ($scope.createForm.roomname === '') {
          $scope.createForm.error = 'roomname empty';
        } else {
          $scope.createForm.error = '';
          socket.emit('create room', $scope.createForm);
        }
      };
      
      $scope.isEmpty = function(obj) {
        return angular.equals(obj, {});
      };
    }])


  .controller('GameCtrl', ['$scope', '$http',
    function ($scope, $http) {
      // tell the server you're on #/game
      socket.emit('game');
      
      // socket events
      socket.removeAllListeners();
      
      socket.on('game init', function(data) {
        $scope.client = data.client;
        $scope.room = data.room;
        $scope.chat = data.chat;
        $scope.game = data.game;
        $scope.$apply();
        
        // scroll chat to bottom
        var $chatScrollable = $('#chat .panel-body:nth-child(2)');
        $chatScrollable.scrollTop($chatScrollable[0].scrollHeight);
        
        // start animation
        requestAnimationFrame(step);
      });
      
      socket.on('room', function(data) {
        $scope.room = data;
        $scope.$apply();
      });
      
      socket.on('chat message', function(data) {
        var $chatScrollable = $('#chat .panel-body:nth-child(2)');
        var autoScroll = false;
        if ($chatScrollable.scrollTop() + $chatScrollable.outerHeight() === $chatScrollable[0].scrollHeight)
          autoScroll = true;
        
        // update chat
        $scope.chat.push(data);
        $scope.$apply();
        
        // auto scroll chat to bottom
        if (autoScroll)
          $chatScrollable.scrollTop($chatScrollable[0].scrollHeight);
      });
      
      socket.on('game', function(data) {
        $scope.game = data;
        $scope.$apply();
      });
      
      // scope init
      $scope.client;
      $scope.room;
      $scope.chat;
      $scope.game;
      
      /* key events
       * 'enter' is reserved by the chat :
       * if the chat input isn't selected, 'enter' triggers the focus
       * if the chat input is selected, 'escape' triggers the blur
       */
      var $chatMessage = $('#chatMessage');
      var keys = [];
      var keyInterval = null;
      
      // remove previous event handlers
      $(document).off();
      
      $(document).keydown(function(evt) {
        var keyCode = evt.keyCode;
        
        if (!$chatMessage.is(':focus')) {
          // 'enter' key
          if (keyCode === 13) {
            evt.preventDefault();
            $chatMessage.focus();
          } else
          // game keys
          if ([37, 38, 39].indexOf(keyCode) !== -1 && keys.indexOf(keyCode) === -1) {
            keys.push(keyCode);
            if (!keyInterval)
              keyInterval = setInterval(function() {
                socket.emit('keys', keys);
              }, 30);
          }
        } else {
          // 'esc' key
          if (keyCode === 27) {
            $chatMessage.blur();
          }
        }
      });
      
      $(document).keyup(function(evt) {
        var keyCode = evt.keyCode;
        // game keys
        if (keys.indexOf(keyCode) !== -1)
          keys.splice(keys.indexOf(keyCode));
        if (keyInterval && !keys.length) {
          clearInterval(keyInterval);
          keyInterval = null;
        }
      });
      
      $chatMessage.parent().submit(function() {
        socket.emit('chat message', $chatMessage.val());
        $chatMessage.val('');
      });
      
      // canvas sizing
      var resize = function() {
        var canvas = document.getElementsByTagName('canvas')[0];
        canvas.width = window.innerWidth;
        canvas.height = canvas.width / (16/9);
      };
      resize();

      $(window).resize(function(evt) {
        if (evt.target === window) {
          resize();
        }
      });
      
      // game animation
      var step = function() {
        draw();
        requestAnimationFrame(step);
      };
      
      // game rendering
      var draw = function() {
        var canvas = document.getElementsByTagName('canvas')[0];
        var ctx = canvas.getContext('2d');
        var game = $scope.game;
        var players = game.players;
        
        // background
        ctx.fillStyle = '#86c2ff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#81582f';
        ctx.fillRect(0, canvas.height*0.9, canvas.width, canvas.height*0.1);
        
        // players
        ctx.fillStyle = '#000';
        for (var i=0; i<players.length; i++) {
          ctx.beginPath();
          ctx.arc(players[i].x*canvas.width/100, canvas.height*(0.86 - players[i].y/100), canvas.height*0.04, 0, 2*Math.PI, false);
          ctx.fill();
        }
        
        // player tags
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        for (var i=0; i<players.length; i++) {
          x = players[i].x * canvas.width / 100;
          y = canvas.height * (0.77 - players[i].y / 100);
          ctx.strokeText(players[i].name, x, y);
          ctx.fillText(players[i].name, x, y);
        }
        
        /*var tags = document.getElementById('tags').children;
        for (var i=0; i<players.length; i++) {
          tags[i].style.marginLeft = (players[i].x*canvas.width/100 - tags[i].offsetWidth/2) + 'px';
          tags[i].style.marginTop = (canvas.height*0.9 - 75) + 'px';
        }*/
      };
    }]);