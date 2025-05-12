const info = document.querySelector('.info__button');
const infoText = document.querySelector('.info__container');

info.addEventListener('click', function() {
    info.classList.toggle('is-active');
    infoText.classList.toggle('active');
});

const diff = document.querySelector('.diff__button');
const diffText = document.querySelector('.diff__container');

diff.addEventListener('click', function() {
    diff.classList.toggle('is-active');
    diffText.classList.toggle('active');
});

const play = document.querySelector('.play__button');

play.addEventListener('click', function() {
    var selected = document.getElementById('diff__select').value
    if (selected == 1){localStorage.difficulty = 1}
    else if (selected == 2){localStorage.difficulty = 3}
    else {localStorage.difficulty = 8}
    window.location.replace("tetris.html");
});

const high = document.querySelector('.highscore__container h1');

high.innerHTML = "HIGHSCORE : " + localStorage.highscore

const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');

menu.addEventListener('click', function() {
    menu.classList.toggle('is-active');
    menuLinks.classList.toggle('active');
});