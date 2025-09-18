// Это общий файл со всеми скриптами, которые размещены в разные файлы в папке js
(function () {
  'use strict';

  // Конструктор
  function Game() {

    // Размеры карты
    this.W = 40;
    this.H = 24;
    this.T = 25;

    // Ссылка на DOM элемент
    this.$field = null;

    // Карта: 'W' — стена, '.' — пол
    this.grid = [];

    // Информация о карте (комнаты и проходы)
    this.rooms = [];
    this.vertCorridors = [];
    this.horzCorridors = [];

    // Предметы: {type:'SW'|'HP', x, y}
    this.items = [];

    // Герой {x,y,hp,maxHp,atk}
    this.player = null;

    // Противники {id,x,y,hp,maxHp,atk}
    this.enemies = [];

    // Объект для хранения занятых клеток
    this.occ = {};

    // Флаг завершения игры
    this.gameOver = false;

    // Параметры предметов
    this.HEAL_AMOUNT = 30;
    this.SWORD_BONUS = 10;
  }

  // Функция для генерации чисел
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  // Функция для перевода 2D в 1D
  function keyXY(x, y, W) { return (y * W + x).toString(); }

  // Функция для выбора случайных чисел из диапазона (используем для выбора случайных коридоров)
  function pickDistinct(k, min, max) {
    var set = {}, arr = [], tries = 0, limit = 1000, v;
    while (arr.length < k && tries++ < limit) { v = randInt(min, max); if (!set[v]) { set[v] = true; arr.push(v); } }
    return arr;
  }

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

  // Вызывается после new Game()
  Game.prototype.init = function () {

    this.$field = $('.field');
    this.$field.css({ width: this.W * this.T + 'px', height: this.H * this.T + 'px' });

    this.generateAllWalls();
    this.generateRooms();
    this.generateCorridors();
    this.placeItems();
    this.placePlayer();
    this.placeEnemies();

    this.bindKeys();
    this.render();
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

  // Реализация перемещения
  Game.prototype.bindKeys = function () {
    var self = this;
    $(window).on('keydown.rogue', function (e) {
      if (self.gameOver) return;
      var k = e.key;
      if (!k) return;
      var low = k.toLowerCase();

      // Перемещение
      if (low === 'w' || low === 'a' || low === 's' || low === 'd') {
        e.preventDefault();
        var dx = 0, dy = 0;
        if (low === 'w') dy = -1;
        else if (low === 'a') dx = -1;
        else if (low === 's') dy = 1;
        else if (low === 'd') dx = 1;
        if (self.tryMovePlayer(dx, dy)) {
          self.enemyTurn();
        }
        return;
      }

      // Атака
      if (k === ' ' || e.code === 'Space' || low === 'spacebar') {
        e.preventDefault();
        var hit = self.attackAdjacent();
        self.enemyTurn();
        return;
      }
    });
  };

  // Перемещение персонажа
  Game.prototype.tryMovePlayer = function (dx, dy) {
    if (!this.player) return false;
    var nx = this.player.x + dx;
    var ny = this.player.y + dy;
    if (!this.canStep(nx, ny)) return false;

    // Освобождение предыдущей клетки
    this.occ[keyXY(this.player.x, this.player.y, this.W)] = false;

    // Перемещение в новую клетку
    this.player.x = nx;
    this.player.y = ny;

    // Подбираем предмет если он есть
    this.pickUpItemAt(nx, ny);

    // Занимаем новую клетку
    this.occ[keyXY(nx, ny, this.W)] = true;

    this.render();
    return true;
  };

  // Реализация атаки персонажа
  Game.prototype.attackAdjacent = function () {
    if (!this.player) return false;

    // Сохраняем соседние 4 клетки
    var px = this.player.x, py = this.player.y, dmg = this.player.atk;
    var neighbors = [
      { x: px + 1, y: py }, { x: px - 1, y: py },
      { x: px, y: py + 1 }, { x: px, y: py - 1 }
    ];

    // Поиск врага
    var toHit = [], i, e;
    for (i = 0; i < neighbors.length; i++) {
      e = this.enemyAt(neighbors[i].x, neighbors[i].y);
      if (e) toHit.push(e);
    }
    if (toHit.length === 0) return false;
    
    // Уменьшаем HP у врага
    for (i = 0; i < toHit.length; i++) toHit[i].hp -= dmg;

    // Удаляем врагов у которых HP <= 0
    for (i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].hp <= 0) {
        var ex = this.enemies[i].x, ey = this.enemies[i].y;
        this.occ[keyXY(ex, ey, this.W)] = false;
        this.enemies.splice(i, 1);
      }
    }

    this.render();
    return true;
  };

  // Реализация ИИ
  Game.prototype.enemyTurn = function () {
    if (this.gameOver) return;
    var px = this.player.x, py = this.player.y;

    // Создаем карту занятости с игроком и врагами
    var occupied = {};
    for (var i = 0; i < this.enemies.length; i++) {
      occupied[keyXY(this.enemies[i].x, this.enemies[i].y, this.W)] = true;
    }
    occupied[keyXY(px, py, this.W)] = true;

    // Перебор врагов
    for (var idx = 0; idx < this.enemies.length; idx++) {
      var e = this.enemies[idx];

      // Если враг рядом с игроком, то атакует
      if (this.isAdjacent(e.x, e.y, px, py)) {
        this.player.hp -= e.atk;
        if (this.player.hp < 0) this.player.hp = 0;
        continue;
      }

      // Реализация перемещения врага
      var dx = 0, dy = 0;
      if (Math.random() < 0.5) {
        dx = (px > e.x) ? 1 : (px < e.x ? -1 : 0);
        if (dx !== 0 && this.canEnemyStep(e.x + dx, e.y) && !occupied[keyXY(e.x + dx, e.y, this.W)]) {
          occupied[keyXY(e.x, e.y, this.W)] = false;
          e.x += dx;
          occupied[keyXY(e.x, e.y, this.W)] = true;
          continue;
        }
        dy = (py > e.y) ? 1 : (py < e.y ? -1 : 0);
        if (dy !== 0 && this.canEnemyStep(e.x, e.y + dy) && !occupied[keyXY(e.x, e.y + dy, this.W)]) {
          occupied[keyXY(e.x, e.y, this.W)] = false;
          e.y += dy;
          occupied[keyXY(e.x, e.y, this.W)] = true;
          continue;
        }
      } else {
        dy = (py > e.y) ? 1 : (py < e.y ? -1 : 0);
        if (dy !== 0 && this.canEnemyStep(e.x, e.y + dy) && !occupied[keyXY(e.x, e.y + dy, this.W)]) {
          occupied[keyXY(e.x, e.y, this.W)] = false;
          e.y += dy;
          occupied[keyXY(e.x, e.y, this.W)] = true;
          continue;
        }
        dx = (px > e.x) ? 1 : (px < e.x ? -1 : 0);
        if (dx !== 0 && this.canEnemyStep(e.x + dx, e.y) && !occupied[keyXY(e.x + dx, e.y, this.W)]) {
          occupied[keyXY(e.x, e.y, this.W)] = false;
          e.x += dx;
          occupied[keyXY(e.x, e.y, this.W)] = true;
          continue;
        }
      }
    }

    this.checkGameOver();
    this.render();
  };

  // Проверка окончания игры
  Game.prototype.checkGameOver = function () {
    if (this.player && this.player.hp <= 0) {
      this.gameOver = true;
      $(window).off('keydown.rogue');
      alert('Вы погибли! Игра окончена.');
    }
  };

  // Создание тайла (одна клетка игрового поля)
  Game.prototype._tileEl = function (x, y, extraClass) {
    return $('<div/>')
      .addClass('tile' + (extraClass ? ' ' + extraClass : ''))
      .css({ left: (x * this.T) + 'px', top: (y * this.T) + 'px', width: this.T + 'px', height: this.T + 'px' });
  };

  // Рендер
  Game.prototype.render = function () {

    // Очистка контейнера
    var $f = this.$field;
    $f.empty();

    // Пол и стены
    for (var y = 0; y < this.H; y++) {
      for (var x = 0; x < this.W; x++) {
        $f.append(this._tileEl(x, y, this.grid[y][x] === 'W' ? 'tileW' : ''));
      }
    }

    // Предметы
    for (var i = 0; i < this.items.length; i++) {
      var it = this.items[i];
      $f.append(this._tileEl(it.x, it.y, it.type === 'SW' ? 'tileSW' : 'tileHP'));
    }

    // Враги
    for (var k = 0; k < this.enemies.length; k++) {
      var e = this.enemies[k];
      var $e = this._tileEl(e.x, e.y, 'tileE');
      var ep = Math.max(0, Math.min(100, Math.round(100 * e.hp / e.maxHp)));
      $e.append($('<div/>').addClass('health').attr('style', 'width:' + ep + '%;'));
      $f.append($e);
    }

    // Герой
    if (this.player) {
      var $p = this._tileEl(this.player.x, this.player.y, 'tileP');
      var pp = Math.max(0, Math.min(100, Math.round(100 * this.player.hp / this.player.maxHp)));
      $p.append($('<div/>').addClass('health').attr('style', 'width:' + pp + '%;'));
      $f.append($p);
    }
  };

  // Экспорт
  window.Game = Game;
})();
