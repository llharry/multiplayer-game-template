angular
  .module('multiFilters', [])

  .filter('arrayToString', function() {
    return function(input) {
      // comparison function to sort alphabetically, case insensitive
      var comp = function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      }
      return input.sort(comp).join('<br>');
    };
  });