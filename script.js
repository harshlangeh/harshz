

let plus = document.getElementById("inc");
let minus = document.getElementById("dec");
let counter = document.getElementById("count");

let count  = 0;

function increment(){
    count++
    counter.textContent = count
}

function dec(){
    count--
    counter.textContent = count
}

plus.addEventListener("click", increment)
minus.addEventListener("click", dec)


