(function (window, $) {
  'use strict';
  var Game = window.Game;

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
    if (this.enemies.length === 0) {
      this.gameOver = true;
      $(window).off('keydown.rogue');
      alert('Победа! Все противники повержены.');
      return;
    }
  };
})(window, jQuery);
