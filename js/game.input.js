(function (window, $) {
  'use strict';
  var Game = window.Game;

  // Реализация перемещения
  Game.prototype.bindKeys = function () {
    var self = this;
    $(window).on('keydown.rogue', function (e) {
      if (self.gameOver) return;
      var k = e.key;
      if (!k) return;
      var low = k.toLowerCase();

      // Перемещение
      if (low === 'w' || low === 'a' || low === 's' || low === 'd' || low === 'ц' || low === 'ф' || low === 'ы' || low === 'в') {
        e.preventDefault();
        var dx = 0, dy = 0;
        if (low === 'w' || low === 'ц') dy = -1;
        else if (low === 'a' || low === 'ф') dx = -1;
        else if (low === 's' || low === 'ы') dy = 1;
        else if (low === 'd' || low === 'в') dx = 1;
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

    this.checkGameOver();
    if (this.gameOver) { this.render(); return true; }

    this.render();
    return true;
  };
})(window, jQuery);
