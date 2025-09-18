(function (window, $) {
  'use strict';
  var Game = window.Game;

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
})(window, jQuery);
