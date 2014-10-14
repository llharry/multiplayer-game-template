angular
  .module('multiApp', [
    'ngRoute',
    'multiControllers',
    'multiFilters',
    'ui.bootstrap'
  ])
  .config(['$routeProvider',
    function($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'home.html',
          controller: 'HomeCtrl'
        })
        .when('/game', {
          templateUrl: 'game.html',
          controller: 'GameCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });
    }]);