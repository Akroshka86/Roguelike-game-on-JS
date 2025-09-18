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

  // Глобальные пресеты сложностей
  Game.DIFFICULTIES = {
    // Противник, HPпротивник, Атака противник, зелья, мечи, жизни за зелья, бонус за меч
    easy:   { enemies: 8,  enemyHp: 25, enemyAtk: 4,  potions: 12, swords: 2, heal: 35, swordBonus: 10 },
    normal: { enemies: 10, enemyHp: 30, enemyAtk: 5,  potions: 10, swords: 2, heal: 30, swordBonus: 10 },
    hard:   { enemies: 14, enemyHp: 40, enemyAtk: 6,  potions: 8,  swords: 1, heal: 25, swordBonus: 10 }
  };

  // Текущая сложность и применение пресета
  Game.prototype.setDifficulty = function (name) {
    var cfg = Game.DIFFICULTIES[name] || Game.DIFFICULTIES.normal;
    this.difficulty = name;
    this.config = cfg;
    this.HEAL_AMOUNT = cfg.heal;
    this.SWORD_BONUS = cfg.swordBonus;
  };

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
