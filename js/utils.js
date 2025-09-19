(function (window) {
  'use strict';

  // Функция для генерации чисел
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  // Функция для перевода 2D в 1D
  function keyXY(x, y, W) { return (y * W + x).toString(); }

  // Функция для выбора случайных чисел из диапазона (используем для выбора случайных коридоров)
  function pickDistinct(k, min, max, minGap) {
    var chosen = [], tries = 0, limit = 1000;
    while (chosen.length < k && tries++ < limit) {
      var v = randInt(min, max);
      var flag = true;
      for (var i = 0; i < chosen.length; i++) {
        if (Math.abs(chosen[i] - v) <= minGap) { flag = false; break; }
      }
      if (flag) chosen.push(v);
    }
    chosen.sort(function(a,b){ return a-b; });
    return chosen;
  }



  window.randInt = randInt;
  window.keyXY = keyXY;
  window.pickDistinct = pickDistinct;
})(window);
