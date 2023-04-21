var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var points = [];
 
    canvas.addEventListener("click", function (event) {
      var rect = canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      points.push({ x: x, y: y });
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
 
  function dbscan(data, eps, minPts) {

    function findNeighbors(point, data, eps) {
      var neighbors = [];
    for(let p of data){
      if(distance(point,p)<eps){
        neighbors.push(p);
      }
    }
    return neighbors;
  }
 
  function distance(p, q) {
    var dx = p.x - q.x;
    var dy = p.y - q.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
 
  function isCorePoint(point, neighbors, eps, minPts) {
    return neighbors.length >= minPts;
  }
 
  var visited = new Set();
  var clusters = new Array();
 
  for (let point of data) {
    if (visited.has(point)) continue;
    visited.add(point);
 
    var neighbors = findNeighbors(point, data, eps);
    if (!isCorePoint(point, neighbors, eps, minPts)) continue;
 
    var cluster = [point];
    clusters.push(cluster);
 
    for (let neighbor of neighbors) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
 
      var neighborNeighbors = findNeighbors(neighbor, data, eps);
      if (isCorePoint(neighbor, neighborNeighbors, eps, minPts)) {
        neighbors.push(...neighborNeighbors);
      }
 
      var neighborCluster = clusters.find((c) => c.includes(neighbor));
      if (neighborCluster && !cluster.includes(neighbor)) {
        neighborCluster.splice(neighborCluster.indexOf(neighbor), 1);
        cluster.push(neighbor);
      } else if (!neighborCluster) {
        cluster.push(neighbor);
      }
    }
  }
  console.log(clusters.length);
  return clusters;
}
 
  function getRandomColor() {
  // Генерируем случайные значения для каждого цветового канала
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
 
  // Задаем код цвета при помощи случайных rgb
  let colorCode = "#" + r.toString(16) + g.toString(16) + b.toString(16);
 
  return colorCode;
}
 
function colorizeClusters(points,eps,minPts) {
  var clusters = dbscan(points,eps,minPts);
  var noisePoints = points;
  for (let i = 0; i < clusters.length; i++) {
    var color = getRandomColor();
    for (let j = 0; j < clusters[i].length; j++) {
      var point = clusters[i][j];
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
  for(let cluster of clusters){
    noisePoints = noisePoints.filter(p => !cluster.includes(p));
  }

  for(let point of noisePoints){
    ctx.fillStyle = "#808080"
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }

  ctx.fillStyle = "#000000"
}