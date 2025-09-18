(function (window) {
  'use strict';
  var Game = window.Game;

// Поиск врага в заданной клетке
  Game.prototype.enemyAt = function (x, y) {
    for (var i = 0; i < this.enemies.length; i++) {
      var e = this.enemies[i];
      if (e.x === x && e.y === y) return e;
    }
    return null;
  };

  // Проверка соседства двух клеток
  Game.prototype.isAdjacent = function (x1, y1, x2, y2) {
    return (Math.abs(x1 - x2) + Math.abs(y1 - y2)) === 1;
  };

  // Проверка, можно ли герою переместиться на клетку
  Game.prototype.canStep = function (x, y) {
    if (x < 0 || y < 0 || x >= this.W || y >= this.H) return false;
    if (this.grid[y][x] !== '.') return false;
    if (this.enemyAt(x, y)) return false;
    return true;
  };

  // Проверка, можно ли врагу переместиться на клетку
  Game.prototype.canEnemyStep = function (x, y) {
    if (x < 0 || y < 0 || x >= this.W || y >= this.H) return false;
    if (this.grid[y][x] !== '.') return false;
    if (this.player && this.player.x === x && this.player.y === y) return false;
    if (this.enemyAt(x, y)) return false;
    return true;
  };

// Генерация объектов на карте
  Game.prototype.placeItems = function () {
    var i, pos;

    // Спавн 2 мечей
    for (i = 0; i < 2; i++) {
      pos = this.randomEmptyCell(); if (!pos) break;
      this.items.push({ type: 'SW', x: pos.x, y: pos.y });
      this.occ[keyXY(pos.x, pos.y, this.W)] = true;
    }

    // Спавн 10 зелий
    for (i = 0; i < 10; i++) {
      pos = this.randomEmptyCell(); if (!pos) break;
      this.items.push({ type: 'HP', x: pos.x, y: pos.y });
      this.occ[keyXY(pos.x, pos.y, this.W)] = true;
    }
  };

  // Спавн игрока
  Game.prototype.placePlayer = function () {
    var pos = this.randomEmptyCell();
    if (!pos) return;
    this.player = { x: pos.x, y: pos.y, hp: 100, maxHp: 100, atk: 10 };
    this.occ[keyXY(pos.x, pos.y, this.W)] = true;
  };

  // Спавн 10 противников
  Game.prototype.placeEnemies = function () {
    var i, pos;
    for (i = 0; i < 10; i++) {
      pos = this.randomEmptyCell();
      if (!pos) break;
      var enemy = { id: i, x: pos.x, y: pos.y, hp: 30, maxHp: 30, atk: 5 };
      this.enemies.push(enemy);
      this.occ[keyXY(pos.x, pos.y, this.W)] = true;
    }
  };

  // Поиск предмета в определенной клетке
  Game.prototype.itemIndexAt = function (x, y) {
    for (var i = 0; i < this.items.length; i++) {
      var it = this.items[i];
      if (it.x === x && it.y === y) return i;
    }
    return -1;
  };

  // Применение эффекта и удаление предмета
  Game.prototype.pickUpItemAt = function (x, y) {
    var idx = this.itemIndexAt(x, y);
    if (idx === -1) return false;
    var it = this.items[idx];
    if (it.type === 'HP') {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.HEAL_AMOUNT);
    } else if (it.type === 'SW') {
      this.player.atk += this.SWORD_BONUS;
    }
    this.items.splice(idx, 1);
    this.occ[keyXY(x, y, this.W)] = false;
    return true;
  };
})(window);
