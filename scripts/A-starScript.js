var n = document.getElementById("size").value;
var table = document.getElementById("table");
var start = null;
var end = null;
var impassables = new Set();

generateMap();

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

function findPath() {

    // Удаляем старый путь

    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            var cell = table.rows[i].cells[j];
            cell.classList.remove("path");
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

function showPath(cameFrom, current) {
    // Отображаем найденный путь
    while (cameFrom.has(current)) {
      current = cameFrom.get(current);
      if (current != start) {
        current.classList.add("path");
      }
    }
}