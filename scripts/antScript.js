var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// массив всех точек
var points = new Array();

// матрица расстояний между точками
var distances = [];
 
// количество муравьев
var antCount = 10;
  
// коэффициенты влияния феромона и расстояния
var alpha = 1;
var beta = 2;
  
// коэффициент испарения
var evaporation = 0.5;
  
// начальное количество феромона на ребрах
var initialPheromone = 1;
  
// максимальное количество итераций алгоритма
var maxIterations = 100;
 
// инициализация феромона на ребрах
var pheromone = [];
  
canvas.addEventListener("mousedown", function (event) {
    var rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let curPoint = {x: x, y: y};
    points.push(curPoint);
    
    // переписываем матрицу расстояний
    for(let i = 0; i < distances.length; i++){
        distances[i].push(getDistance(points[i], curPoint));
    }
    distances.push([]);
    for(let i = 0; i < points.length; i++){
        distances[distances.length - 1].push(getDistance(curPoint, points[i]));
    }
    
    let newPheromones = [];


    // тут создаем новую матрицу феромонов
    for (var i = 0; i < distances.length; i++) {
        var row = [];
        for (var j = 0; j < distances[i].length; j++) {
          row.push(initialPheromone);
        }
        newPheromones.push(row);
    }

    pheromone = newPheromones;

    // рисуем точку на холсте
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();
});

// функция вычисления расстояния между точками
function getDistance(fPoint,sPoint){
        return Math.round(Math.sqrt(Math.abs(Math.pow(sPoint.x-fPoint.x,2)+Math.pow(sPoint.y-fPoint.y,2))));
}

// функция отрисовки пути
function drawTour(tour) {
    // очистка и перерисовка точек
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0;i<points.length;i++){
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 10, 0, 2 * Math.PI);
        ctx.fill();
    }
    // вывод лучшего пути
    ctx.moveTo(points[tour[0]].x, points[tour[0]].y);
    for (let i=1;i<tour.length;i++) {
      endPoint = points[tour[i]];
      ctx.lineTo(endPoint.x, endPoint.y);
    }
    ctx.lineTo(points[tour[0]].x, points[tour[0]].y);
    ctx.stroke();
  }
  
// функция для выбора следущего города
function selectNextCity(ant, visited) {
    var pheromoneValues = [];
    var total = 0;
    var currentCity = ant.currentCity;
    // вычисление желания идти в город
    for (var i = 0; i < distances[currentCity].length; i++) {
        if (!visited.includes(i)) {
            var pheromoneValue = Math.pow(pheromone[currentCity][i], alpha);
            var distanceValue = Math.pow(1 / distances[currentCity][i], beta);
            pheromoneValues.push({ city: i, value: pheromoneValue * distanceValue });
            total += pheromoneValue * distanceValue;
        }
    }
    var random = Math.random() * total;
    var valueSum = 0;
    // на выбор города на основе рандомного значения, хотя желание прийти в города различно
    for (var i = 0; i < pheromoneValues.length; i++) {
        valueSum += pheromoneValues[i].value;
        if (valueSum >= random) {
            return pheromoneValues[i].city;
        }
    }
}
  
// Функция для обновления феромона на ребрах
function updatePheromone(ants) {
    for (var i = 0; i < pheromone.length; i++) {
        for (var j = i + 1; j < pheromone[i].length; j++) {
            var delta = 0;
            for (var k = 0; k < ants.length; k++) {
                var ant = ants[k];
                var distance = distances[ant.tour[i]][ant.tour[j]];
                delta += 1 / distance;
            }
        pheromone[i][j] = pheromone[i][j] * evaporation + delta;
        pheromone[j][i] = pheromone[i][j];
        }
    }
}
// Функция для выполнения одной итерации алгоритма
function doIteration(ants) {
    for (var i = 0; i < ants.length; i++) {
        var ant = ants[i];
        // составление пути 
        while (ant.visited.length < distances.length) {
            var nextCity = selectNextCity(ant, ant.visited);
            ant.visited.push(nextCity);
            ant.tour.push(nextCity);
            ant.currentCity = nextCity;
        }
        var distance = 0;
        // расчёт длины пути
        for (var j = 0; j < ant.tour.length - 1; j++) {
            distance += distances[ant.tour[j]][ant.tour[j+1]];
        }
        distance += distances[ant.tour[ant.tour.length-1]][ant.tour[0]];
        ant.distance = distance;
    }
    // испаряем феромоны
    updatePheromone(ants);
}
    
// Функция для выполнения алгоритма
function runAntColonyAlgorithm() {
    var ants = [];
    // рождение муравьёв 
    for (var i = 0; i < antCount; i++) {
        ants.push({
            currentCity: 0,
            visited: [0],
            tour: [0],
            distance: 0
        });
    }
    // создание лучшего из лучших
    var bestAnt = null;
    for (var i = 0; i < maxIterations; i++) {
        doIteration(ants, pheromone, distances, alpha, beta, evaporation);
        for (var j = 0; j < ants.length; j++) {
            var ant = ants[j];
            // если появился муравей лучше лучшего из лучших назначаем ему звание лучшего из лучших
            if (bestAnt == null || ant.distance < bestAnt.distance) {
                bestAnt = { tour: ant.tour.slice(), distance: ant.distance };
            }
        // цикл жизни непрерывен, муравьи умирают, но оставляют за собой феромоны и потомство
        ant.currentCity = 0;
        ant.visited = [0];
        ant.tour = [0];
        ant.distance = 0;
        }
    }
    return bestAnt;
}
function bestofthebest(){
    // находим путь, рисуем, для достоверности выводим в консоль
    var bestAnt = runAntColonyAlgorithm();
    drawTour(bestAnt.tour);
    console.log("Best tour:", bestAnt.tour);
    console.log("Best distance:", bestAnt.distance);
}

  