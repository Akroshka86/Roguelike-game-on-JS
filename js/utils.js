(function (window) {
  'use strict';

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

  window.randInt = randInt;
  window.keyXY = keyXY;
  window.pickDistinct = pickDistinct;
})(window);
