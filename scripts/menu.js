var image = document.getElementById("kot");
var imageName = "kotiki.jpg"; // хранит текущее имя файла изображения

function goToAStar(){
    window.location.href = "A-star.html";
}
function goToClusterization(){
    window.location.href = "clusterization.html";
}
function otherButtons(){
    window.location.href = "mainpage.html";
}

function kotus(){
    if(imageName == "kotiki.jpg"){
        image.src = "referenses/1.jpg";
        imageName = "1.jpg";
    }
    else if(imageName == "1.jpg"){
        image.src = "referenses/2.jpg";
        imageName = "2.jpg";
    }
    else if(imageName == "2.jpg"){
        image.src = "referenses/3.jpg";
        imageName = "3.jpg";
    }
    else if(imageName == "3.jpg"){
        image.src = "referenses/kotiki.jpg";
        imageName = "kotiki.jpg";
    }
}
