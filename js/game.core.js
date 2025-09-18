(function (window, $) {
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

  // Вызывается после new Game()
  Game.prototype.init = function () {
    $(window).off('keydown.rogue');
    this.$field = this.$field || $('.field');
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

  window.Game = Game;
})(window, jQuery);
