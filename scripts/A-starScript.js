var n = document.getElementById("size").value;
var table = document.getElementById("table");
var start = null;
var end = null;
var impassables = new Set();

generateMap();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateMap() {
    n = document.getElementById("size").value;
    var newTable = document.createElement("table");
    for (var i = 0; i < n; i++) {
        var row = document.createElement("tr");
        for (var j = 0; j < n; j++) {
          var cell = document.createElement("td");
          cell.dataset.x = j;
          cell.dataset.y = i;
          cell.addEventListener("click", function () {
            // При клике на ячейку устанавливаем ее как начальную или конечную
            if (start == null && end == null &&!impassables.has(this)) {
              start = this;
              this.classList.add("start");
            } else if (end == null && this != start && !impassables.has(this)) {
              end = this;
              this.classList.add("end");
            }else if(this==start || this==end){
              if(this==start){
                start = null;
                this.classList.remove("start");
              }
              if(this==end){
                end = null;
                this.classList.remove("end");
              }
            } else if (start!=null && end!=null && this!=start && this!=end){
                if (!impassables.has(this)) {
                    impassables.add(this);
                    this.classList.remove("searching");
                    this.classList.add("impassable");
                } else if (impassables.has(this)){
                  impassables.delete(this);
                  this.classList.remove("impassable");
              }
            }
          });
          row.appendChild(cell);
        }
        newTable.appendChild(row);
      }

      // Заменяем старую таблицу новой
    table.parentNode.replaceChild(newTable, table);

    // Сбрасываем переменные и состояние
    table = newTable;
    start = null;
    end = null;
    impassables.clear();
    pathFound = false;
    path = null;
}

async function findPath() {

    // Удаляем старый путь

    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            var cell = table.rows[i].cells[j];
            cell.classList.remove("path");
            cell.classList.remove("searching");
        }
    }

    // Ищем путь 

    if (start == null || end == null) {
      alert("Укажите стартовую и конечную клетки!");
    } else {
      var openSet = new Set([start]);
      var cameFrom = new Map();
      var gScore = new Map([[start, 0]]);
      var fScore = new Map([[start, heuristic(start, end)]]);
      while (openSet.size > 0) {
        var current = getLowestFScore(openSet, fScore);
        if (current == end) {
          showPath(cameFrom, end);
          return;
        }
        openSet.delete(current);
        for (var neighbor of getNeighbors(current)) {
          if (impassables.has(neighbor)) {
            continue;
          }
          var tentativeGScore = gScore.get(current) + 1;
          if (
            !gScore.has(neighbor) ||
            tentativeGScore < gScore.get(neighbor)
          ) {
            cameFrom.set(neighbor, current);
            gScore.set(neighbor, tentativeGScore);
            fScore.set(
              neighbor,
              tentativeGScore + heuristic(neighbor, end)
            );
            if (!openSet.has(neighbor)) {
              openSet.add(neighbor);
              if(neighbor!=end){
                var ms = document.getElementById("animation").value;
                neighbor.classList.add("searching");
                await sleep(ms);
              }
            }
          }
        }
      }
      alert("Путь не найден!");
    }
}

function getLowestFScore(set, scores) {
    // Находим элемент из множества с наименьшим значением fScore
    var lowest = null;
    var lowestScore = Infinity;
    for (var elem of set) {
      if (scores.get(elem) < lowestScore) {
        lowest =         elem;
        lowestScore = scores.get(elem);
      }
    }
    return lowest;
}

function getNeighbors(cell) {
    // Получаем соседние ячейки
    var neighbors = new Set();
    var x = cell.cellIndex;
    var y = cell.parentNode.rowIndex;
    if (x > 0) {
      neighbors.add(table.rows[y].cells[x - 1]);
    }
    if (x < n - 1) {
      neighbors.add(table.rows[y].cells[x + 1]);
    }
    if (y > 0) {
      neighbors.add(table.rows[y - 1].cells[x]);
    }
    if (y < n - 1) {
      neighbors.add(table.rows[y + 1].cells[x]);
    }
    return neighbors;
}

function heuristic(a, b) {
    // Вычисляем эвристическое расстояние между двумя клетками
    var x1 = a.cellIndex;
    var y1 = a.parentNode.rowIndex;
    var x2 = b.cellIndex;
    var y2 = b.parentNode.rowIndex;
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

async function showPath(cameFrom, current) {
    // Отображаем найденный путь
    while (cameFrom.has(current)) {
      current = cameFrom.get(current);
      if (current != start) {
        var ms = document.getElementById("animation").value;
        current.classList.remove("searching");
        current.classList.add("path");
        await sleep(ms);
      }
    }
}
function makeLab(){
  // Создаем двумерный массив для представления карты, устанавливая все ячейки как стены.
let map = [];
for (let w = 0; w < width; w++) {
  map[w] = [];
  for (let h = 0; h < height; h++) {
    map[w][h] = makeWall();
  }
}

// Выбираем случайную ячейку с нечетными x и y координатами и очищаем ее.
let x = getRandomInt(0, width / 2) * 2 + 1;
let y = getRandomInt(0, height / 2) * 2 + 1;
map[x][y] = makeClear();

// Создаем массив и добавляем в него валидные ячейки, которые находятся на расстоянии двух ортогональных клеток от только что очищенной клетки.
let toCheck = [];
if (y - 2 >= 0) {
  toCheck.push({ x: x, y: y - 2 });
}
if (y + 2 < height) {
  toCheck.push({ x: x, y: y + 2 });
}
if (x - 2 >= 0) {
  toCheck.push({ x: x - 2, y: y });
}
if (x + 2 < width) {
  toCheck.push({ x: x + 2, y: y });
}

// Пока есть ячейки в массиве toCheck, выбираем случайную ячейку, очищаем ее и удаляем из массива toCheck.
while (toCheck.length > 0) {
  let index = getRandomInt(0, toCheck.length);
  let cell = toCheck[index];
  x = cell.x;
  y = cell.y;
  map[x][y] = makeClear();
  toCheck.splice(index, 1);

  // Очищенная ячейка должна быть соединена с другой свободной ячейкой.
  // Ищем свободную ячейку на расстоянии двух ортогональных клеток от только что очищенной ячейки.
  let directions = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
  while (directions.length > 0) {
    let dirIndex = getRandomInt(0, directions.length);
    let direction = directions[dirIndex];
    switch (direction) {
      case 'NORTH':
        if (y - 2 >= 0 && map[x][y - 2] === makeClear()) {
          map[x][y - 1] = makeClear();
          directions = [];
        }
        break;
      case 'SOUTH':
        if (y + 2 < height && map[x][y + 2] === makeClear()) {
          map[x][y + 1] = makeClear();
          directions = [];
        }
        break;
      case 'EAST':
        if (x - 2 >= 0 && map[x - 2][y] === makeClear()) {
          map[x - 1][y] = makeClear();
          directions = [];
        }
        break;
      case 'WEST':
        if (x + 2 < width && map[x + 2][y] === makeClear()) {
          map[x + 1][y] = makeClear();
          directions = [];
        }
        break;
    }
    directions.splice(dirIndex, 1);
  }

  // Добавляем в массив toCheck все валидные ячейки, находящиеся на расстоянии двух ортогональных клеток от только что очищенной ячейки и которые еще не добавлены в массив toCheck.
  if (y - 2 >= 0 && map[x][y - 2] === makeWall()) {
    toCheck.push({ x: x, y: y - 2 });
  }
  if (y + 2 < height && map[x][y + 2] === makeWall()) {
    toCheck.push({ x: x, y: y + 2 });
  }
  if (x - 2 >= 0 && map[x - 2][y] === makeWall()) {
    toCheck.push({ x: x - 2, y: y });
  }
  if (x + 2 < width && map[x + 2][y] === makeWall()) {
    toCheck.push({ x: x + 2, y: y });
  }
}

// Функция для создания стены
function makeWall() {
  return 1; // предполагаем, что 1 - это представление стены на карте
}

// Функция для создания прохода
function makeClear() {
  return 0; // предполагаем, что 0 - это представление прохода на карте
}

// Функция для генерации случайного целого числа в заданном диапазоне
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}


}