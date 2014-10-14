/* Array with get/set/delete methods using 'name' attribute
See : http://stackoverflow.com/questions/26247571/javascript-data-structure-key-value-with-key-access-from-the-value
*/

var NameArray = function() {
  var array = new Array();

  array.has = function(name) {
    return this.filter(function(item) {
      return item.name === name;
    }).length > 0;
  };

  array.get = function(name) {
    return this.filter(function(item) {
      return item.name === name;
    })[0];
  };

  array.set = function(name, item) {
    item.name = name;
    this.push(item);
  };

  array.delete = function(name) {
    var i = 0;
    while (i < this.length && this[i].name !== name) i++;
    if (i < this.length) this.splice(i, 1);
  };

  return array;
};

module.exports = NameArray;

/* test
var players = new NameArray();
console.log(players);
players.set('bob', {age:12});
players.set('rick', {age:11});
players.set('jason', {age:10});
players.delete('bob');
players.delete('ryan');

console.log(players);
console.log(players.has('rick'));
console.log(players.has('bob'));
console.log(players.has('kiki'));
*/