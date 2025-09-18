(function (window) {
  'use strict';
  var Game = window.Game;

// Проверка, вмещается ли комната внутрь карты
  Game.prototype._roomFits = function (x, y, w, h) {
    if (x < 1 || y < 1) return false;
    if (x + w > this.W - 1) return false;
    if (y + h > this.H - 1) return false;
    return true;
  };

  // Проверка, чтобы комнаты не накладывались друг на друга
  Game.prototype._roomOverlaps = function (x, y, w, h) {
    var i, j;
    for (j = y; j < y + h; j++) for (i = x; i < x + w; i++) {
      if (this.grid[j][i] !== 'W') return true;
    }
    return false;
  };
  
  // Функция, для "вырезания" комнаты на карте
  Game.prototype._carveRoom = function (x, y, w, h) {
    var i, j;
    for (j = y; j < y + h; j++) for (i = x; i < x + w; i++) {
      this.grid[j][i] = '.';
    }
    this.rooms.push({ x: x, y: y, w: w, h: h });
  };

  // Сброс значений и заполнение поля стеной
  Game.prototype.generateAllWalls = function () {
    var y, x, row;

    // Сбрасываем все значения
    this.grid = [];
    this.rooms = [];
    this.vertCorridors = [];
    this.horzCorridors = [];
    this.items = [];
    this.player = null;
    this.enemies = [];
    this.occ = {};
    this.gameOver = false;

    // Заполняем все поле стенами
    for (y = 0; y < this.H; y++) {
      row = [];
      for (x = 0; x < this.W; x++) row.push('W');
      this.grid.push(row);
    }
  };

  // Генерация комнат
  Game.prototype.generateRooms = function () {
    var want = randInt(5, 10), placed = 0, attempts = 200;
    while (placed < want && attempts-- > 0) {
      var w = randInt(3, 8), h = randInt(3, 8);
      var x = randInt(1, this.W - 1 - w), y = randInt(1, this.H - 1 - h);
      if (!this._roomFits(x, y, w, h)) continue;
      if (this._roomOverlaps(x, y, w, h)) continue;
      this._carveRoom(x, y, w, h);
      placed++;
    }
  };

  // Генерация проходов
  Game.prototype.carveVertical = function (x) { for (var y = 0; y < this.H; y++) this.grid[y][x] = '.'; };
  Game.prototype.carveHorizontal = function (y) { for (var x = 0; x < this.W; x++) this.grid[y][x] = '.'; };

  // Выбирает где будет находится проход и сколько их будет
  Game.prototype.generateCorridors = function () {
    var vCount = randInt(3, 5), hCount = randInt(3, 5);
    var xs = pickDistinct(vCount, 1, this.W - 2), ys = pickDistinct(hCount, 1, this.H - 2);
    for (var i = 0; i < xs.length; i++) this.carveVertical(xs[i]);
    for (var j = 0; j < ys.length; j++) this.carveHorizontal(ys[j]);
    this.vertCorridors = xs; this.horzCorridors = ys;
  };

  // Поиск случайной свободной клетки
  Game.prototype.randomEmptyCell = function () {
    var tries = 0, limit = 4000;
    while (tries++ < limit) {
      var x = randInt(0, this.W - 1), y = randInt(0, this.H - 1);
      if (this.grid[y][x] !== '.') continue;
      var k = keyXY(x, y, this.W);
      if (this.occ[k]) continue;
      return { x: x, y: y };
    }
    return null;
  };
})(window);
