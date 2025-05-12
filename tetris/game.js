import { BLOCKS, co, setBlocks, styles } from "./blockset.js" // importing predefined resources

const gameBoard = document.getElementById('game-board') // targeting html elements to draw blocks on them later
const previewBoard = document.getElementById('preview-board')
const holdBoard = document.getElementById('hold-board')
const startButton = document.getElementById('start-button')
const restartButton = document.getElementById('restart-button')

// declaring variables

let gameStarted = false
let gameOver = false
let done = true // is true when a block hits the ground or game is starting

var score = 0
let end = false // turns true when moving a block down would hit one of the set blocks
let pressed_hold = false

let a = -1 // determines the type of block (L, S, T, ...); initialised as -1 to use with next a
let b // determines the rotation of the current block

let visibleBlock = [] // the current 4 html square divs representing the block
let shadow = [] // grey html divs below a block
const cBlok = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // copy of all the visible blocks on screen (used for clearing lines later)
let next // like a but for the preview
let visNext = [] // like visibleBlock but for preview

let bag = [] // used for the 7-bag randomizer

let held_a = [] // when a block gets put in hold state, the a gets pushed here to use when unholding the block
let visHold = [] // like visibleBlock but for hold
let first_hold = false
let actual_first_hold = true // getting back to that later
let hold = 0

let lastRenderTime = 0
if (localStorage.difficulty === undefined) {localStorage.difficulty = 1} // default, in case of direct link instead of playing from the menu
let speed = localStorage.difficulty // see app.js, speeds is based on the chosen difficulty

function update() { // updating the blocks position or the rest of the board if it hits the ground / clears a line

    end = false

    if (!done) { // not done

        for (let t = 0; t <= setBlocks.length - 1; t ++) { // for all set blocks, check if the current block would hit one if it moved down
            if (
            (BLOCKS[a][b][0].y + 1 == setBlocks[t].y && BLOCKS[a][b][0].x == setBlocks[t].x) ||
            (BLOCKS[a][b][1].y + 1 == setBlocks[t].y && BLOCKS[a][b][1].x == setBlocks[t].x) ||
            (BLOCKS[a][b][2].y + 1 == setBlocks[t].y && BLOCKS[a][b][2].x == setBlocks[t].x) ||
            (BLOCKS[a][b][3].y + 1 == setBlocks[t].y && BLOCKS[a][b][3].x == setBlocks[t].x)
            ) {
            end = true // in that case, end the blocks updating
            }
        }

    if (end)
    {
        for (let k = 0; k <= 3; k++){
            setBlocks.push({ x: BLOCKS[a][b][k].x, y: BLOCKS[a][b][k].y }) // it now becomes one of the set blocks

            shadow[k].remove() // the shadow gets removed too
        }

        clearLines()
        
        if ( // it covers the area where the next block might spawn
        (BLOCKS[a][b][0].y == 0 && (BLOCKS[a][b][0].x == 4 || BLOCKS[a][b][0].x == 5 || BLOCKS[a][b][0].x == 6 || BLOCKS[a][b][0].x == 7)) ||
        (BLOCKS[a][b][1].y == 0 && (BLOCKS[a][b][1].x == 4 || BLOCKS[a][b][1].x == 5 || BLOCKS[a][b][1].x == 6 || BLOCKS[a][b][1].x == 7)) ||
        (BLOCKS[a][b][2].y == 0 && (BLOCKS[a][b][2].x == 4 || BLOCKS[a][b][2].x == 5 || BLOCKS[a][b][2].x == 6 || BLOCKS[a][b][2].x == 7)) ||
        (BLOCKS[a][b][3].y == 0 && (BLOCKS[a][b][3].x == 4 || BLOCKS[a][b][3].x == 5 || BLOCKS[a][b][3].x == 6 || BLOCKS[a][b][3].x == 7))
        ) {
        gameOver = true // end the game
        }

        done = true // if not game over, end the updating
        score += 10

          for (let e = 0; e <= 3; e++){
            for (let f = 0; f <= 3; f++){
    
            BLOCKS[a][e][f].x = co[a][e][f].x
            BLOCKS[a][e][f].y = co[a][e][f].y
    
            }
          }
        hold = 0
        drawPoints()
    }
    else{
        // moving all rotations of the piece at once to have them in the same place when rotating
        for (let e = 0; e <= 3; e++){
        for (let f = 0; f <= 3; f++){

        BLOCKS[a][e][f].y = BLOCKS[a][e][f].y + 1

        }}
        
        draw(a, b)
    }
  }
}

function clearLines() {
    for (let s = 0; s <= 3; s++){ // checking for every of the 4 sub blocks if they complete a line

        let filled0 = 0
        let filled1 = 0
        let filled2 = 0
        let filled3 = 0
        let filleds = [filled0, filled1, filled2, filled3]
        let clears = []

        for (let q = 10; q <= setBlocks.length - 1; q++){ // loop through the set blocks to find how many are in the line of that sub block

          if (setBlocks[q].y == BLOCKS[a][b][s].y){
            filleds[s] ++
          }
        }

        if (filleds[s] == 10) { // 10 means the line is full

          for (let q = 10; q <= setBlocks.length - 1; q++){

            if (setBlocks[q].y == BLOCKS[a][b][s].y){ // do the same loop again, but remove the visuals
              cBlok[q].remove()
              clears.push(q) // remembering the indexes of the seet blocks that were removed
            }
          }

          clears.reverse()

          for (let q = 0; q <= 9; q++){ // using the indexes to remove the array ojects

            setBlocks.splice(clears[q], 1)
            cBlok.splice(clears[q], 1)
          }

          for (let z = 0; z <= setBlocks.length - 1; z++){ // move all other set blocks which were above the cleared line down by one

            if (setBlocks[z].y != 21 && setBlocks[z].y < BLOCKS[a][b][s].y){
              setBlocks[z].y += 1
            }
        }
         
          for (let g = 10; g <= cBlok.length - 1; g++){ // move all other visual set blocks which were above the cleared line down by one

              if (Number(cBlok[g].style.gridRowStart) < BLOCKS[a][b][s].y){
                  cBlok[g].style.gridRowStart = Number(cBlok[g].style.gridRowStart) + 1
              }

              }
           score += 1000 // adding 1000 points per cleared line
        }
      }
}

function drawPoints() { // visualizing points by updating the score label
  document.getElementById('score').innerHTML = 'Score: ' + score
}

function draw() { // drawing an updated block
    
    let g = 0

    BLOCKS[a][b].forEach(segment => { // change the x | y coords to match the ones of BLOCKS
        const Block = visibleBlock[g]
        Block.style.gridRowStart = segment.y
        Block.style.gridColumnStart = segment.x
        g ++

  })
    g = 0
    let distance = []

    // checking the y distance to all set blocks for each of the 4 sub squares 
    for (let m = 0; m <= 3; m++){
      for (let n = 0;n <= setBlocks.length - 1;n++) {
        if (setBlocks[n].x == BLOCKS[a][b][m].x && setBlocks[n].y >= BLOCKS[a][b][m].y){
          distance.push(setBlocks[n].y - BLOCKS[a][b][m].y) // and adding them to an array
        }
      }
    }

    BLOCKS[a][b].forEach(segment => { // for each of those sub blocks the shadow is drawn where the distance to one set block is the closest
        const Block = shadow[g]
        Block.style.gridRowStart = segment.y + Math.min.apply(Math, distance) - 1 
        Block.style.gridColumnStart = segment.x
        g ++
  })

}

function randomBlock() { // the 7-bag randomizer, used to prevent either the same piece spawning too often or too little, see also at: https://simon.lc/the-history-of-tetris-randomizers
  
  if (bag.length == 0) { // creating a new bag if old one is empty
    bag = [0, 1, 2, 3, 4, 5, 6]
    bag = bag.sort(() => Math.random() - 0.5) // shuffle()
  }
  return bag[0] // returns the first element
}

function spawn() {

  // resetting stuff from last block
  visibleBlock = []
  shadow = []
  b = 0

  if (pressed_hold && !first_hold) { // if hold is pressed, use a from the held block
    pressed_hold = false
    a = held_a[held_a.length - 2]
    held_a.shift()

  }else{

  if (a == - 1) {a = Math.floor(Math.random() * 7)}else{ // on the first spawn, a is truely random
    a = next //                                             after that it becomes the NEXT block
    for (let i = 0; i <= 3; i++){//                         which is generated with 7-bag
      visNext[i].remove() // previous next block gets removed
    }
  }

  next = randomBlock() // ...number
  bag.shift() // removes the first element of the bag

  visNext = []

  BLOCKS[next][b].forEach(segment => { // create and draw next block

    const Block = document.createElement('div')
    if (next == 5) {Block.style.gridRowStart = segment.y - 4 // displays the O block centered
                    Block.style.gridColumnStart = segment.x - 3}
    else {
        Block.style.gridRowStart = segment.y - 4
        Block.style.gridColumnStart = segment.x - 4
    }
    
    Block.classList.add(styles[next])
    visNext.push(Block)
    
    previewBoard.appendChild(Block)
  })
}

  for (let n = 0;n <= 3; n++){ // create shadow
    const BlockShadow = document.createElement('div')

    BlockShadow.classList.add('shadow')
    shadow.push(BlockShadow)
    
    gameBoard.appendChild(BlockShadow)
  }
    

  BLOCKS[a][b].forEach(segment => { // create and draw main block
    const Block = document.createElement('div')
    
    Block.style.gridColumnStart = segment.x
    Block.style.gridRowStart = segment.y

    Block.classList.add(styles[a])
    visibleBlock.push(Block)
    cBlok.push(Block)
    
    gameBoard.appendChild(Block)
  })

  done = false // new block thats to be updated is there
}

function main(currentTime) {
    if (gameOver) {
        if (score > localStorage.highscore || localStorage.highscore === undefined) {
            localStorage.highscore = score
        }
        return
    }

    if (!gameStarted) {
        startButton.style.display = 'block'
            return
    }

    window.requestAnimationFrame(main)
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000
    if (secondsSinceLastRender < 1 / speed) return

    lastRenderTime = currentTime

    if (done) {
        speed = localStorage.difficulty // reset the speed
        spawn()
    }
    update()
}

function startGame() {
    gameStarted = true
    startButton.style.display = 'none'
    resetGame()
    window.requestAnimationFrame(main)
}

function resetGame() {
    // Save high score if needed
    if (score > localStorage.highscore || localStorage.highscore === undefined) {
        localStorage.highscore = score
    }
    
    // Reset game state
    gameOver = false
    done = true
    score = 0
    setBlocks.length = 10
    
    // Clear all boards
    while (gameBoard.firstChild) {
        gameBoard.removeChild(gameBoard.firstChild)
    }
    while (previewBoard.firstChild) {
        previewBoard.removeChild(previewBoard.firstChild)
    }
    while (holdBoard.firstChild) {
        holdBoard.removeChild(holdBoard.firstChild)
    }
    
    // Reset all game variables
    visibleBlock = []
    shadow = []
    bag = []
    held_a = []
    visNext = []
    visHold = []
    first_hold = false
    actual_first_hold = true
    hold = 0
    a = -1
    b = 0
    speed = localStorage.difficulty
    drawPoints()
}

function restartGame() {
    gameStarted = false
    startButton.style.display = 'block'
    resetGame()
}

// Add event listeners for the buttons
startButton.textContent = "Terd cutie"
startButton.style.display = 'block' // Ensure start button is visible initially

startButton.addEventListener('click', startGame)
restartButton.addEventListener('click', restartGame)

// Initialize the game
window.requestAnimationFrame(main)

/*============================================== controls ==============================================*/

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// for wall bounce 
let validmove2

function rotate_right() {
  valid_move = true
  validmove2 = true

  for (let t = 0; t <= setBlocks.length - 1; t ++) {

  if ( // if the block would hit another block after rotating
  (BLOCKS[a][(b + 1) % 4][0].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][0].x == setBlocks[t].x) ||
  (BLOCKS[a][(b + 1) % 4][1].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][1].x == setBlocks[t].x) ||
  (BLOCKS[a][(b + 1) % 4][2].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][2].x == setBlocks[t].x) ||
  (BLOCKS[a][(b + 1) % 4][3].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][3].x == setBlocks[t].x)
  ){valid_move = false; break}} // <--
  
  if(BLOCKS[a][(b + 1) % 4][0].x == 11 || // or if it would hit one of the left or right walls
     BLOCKS[a][(b + 1) % 4][1].x == 11 ||
     BLOCKS[a][(b + 1) % 4][2].x == 11 ||
     BLOCKS[a][(b + 1) % 4][3].x == 11
  )
    {
      for (let t = 0; t <= setBlocks.length - 1; t ++) {
        if ( // if the block would hit another block after pushing off the wall
           (BLOCKS[a][(b + 1) % 4][0].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][0].x - 1 == setBlocks[t].x) ||
           (BLOCKS[a][(b + 1) % 4][1].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][1].x - 1 == setBlocks[t].x) ||
           (BLOCKS[a][(b + 1) % 4][2].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][2].x - 1 == setBlocks[t].x) ||
           (BLOCKS[a][(b + 1) % 4][3].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][3].x - 1 == setBlocks[t].x)
           ){valid_move = false; break}
        if (a == 3 && b == 3 && (
           (BLOCKS[a][(b + 1) % 4][0].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][0].x - 2 == setBlocks[t].x) ||
           (BLOCKS[a][(b + 1) % 4][1].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][1].x - 2 == setBlocks[t].x) ||
           (BLOCKS[a][(b + 1) % 4][2].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][2].x - 2 == setBlocks[t].x) ||
           (BLOCKS[a][(b + 1) % 4][3].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][3].x - 2 == setBlocks[t].x)
           )){validmove2 = false; valid_move = false; break}
      }
      // move the block off the wall
      if (valid_move) {left_move()}
      if (a == 3 && b == 3 && validmove2 && valid_move) {left_move()} // since the I block is longer
    }
  if(BLOCKS[a][(b + 1) % 4][0].x == 0 ||
     BLOCKS[a][(b + 1) % 4][1].x == 0 ||
     BLOCKS[a][(b + 1) % 4][2].x == 0 ||
     BLOCKS[a][(b + 1) % 4][3].x == 0
  )
    {
      for (let t = 0; t <= setBlocks.length - 1; t ++) {
        if (
           (BLOCKS[a][(b + 1) % 4][0].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][0].x + 1 == setBlocks[t].x) ||
           (BLOCKS[a][(b + 1) % 4][1].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][1].x + 1 == setBlocks[t].x) ||
           (BLOCKS[a][(b + 1) % 4][2].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][2].x + 1 == setBlocks[t].x) ||
           (BLOCKS[a][(b + 1) % 4][3].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][3].x + 1 == setBlocks[t].x)
           ){valid_move = false; break}
        if (a == 3 && b == 1 && (
           (BLOCKS[a][(b + 1) % 4][0].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][0].x + 2 == setBlocks[t].x) ||
           (BLOCKS[a][(b + 1) % 4][1].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][1].x + 2 == setBlocks[t].x) ||
           (BLOCKS[a][(b + 1) % 4][2].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][2].x + 2 == setBlocks[t].x) ||
           (BLOCKS[a][(b + 1) % 4][3].y == setBlocks[t].y && BLOCKS[a][(b + 1) % 4][3].x + 2 == setBlocks[t].x)
           )){validmove2 = false; valid_move = false; break}
      }
      if (valid_move) {right_move()} else {valid_move = false}
      if (a == 3 && b == 1 && validmove2 && valid_move) {right_move()}
    }

  if(valid_move && !done && !end){
  b = (b + 1) % 4 // update b
  draw()}
}

async function right_move() {
  valid_move = true

  for (let t = 0; t <= setBlocks.length - 1; t ++) {

  if (
  (BLOCKS[a][b][0].y == setBlocks[t].y && BLOCKS[a][b][0].x + 1 == setBlocks[t].x) ||
  (BLOCKS[a][b][1].y == setBlocks[t].y && BLOCKS[a][b][1].x + 1 == setBlocks[t].x) ||
  (BLOCKS[a][b][2].y == setBlocks[t].y && BLOCKS[a][b][2].x + 1 == setBlocks[t].x) ||
  (BLOCKS[a][b][3].y == setBlocks[t].y && BLOCKS[a][b][3].x + 1 == setBlocks[t].x)
  ){valid_move = false; break}}

  if (valid_move && !done && !end) {
      if(BLOCKS[a][b][0].x + 1 != 11 &&
         BLOCKS[a][b][1].x + 1 != 11 &&
         BLOCKS[a][b][2].x + 1 != 11 &&
         BLOCKS[a][b][3].x + 1 != 11){
      
          for (let e = 0; e <= 3; e++){
              for (let f = 0; f <= 3; f++){
      
              BLOCKS[a][e][f].x = BLOCKS[a][e][f].x + 1
      
              }
          }
      }
  draw()
  }
  await sleep(150)
  if (keys.d || keys.r) {right_move()}
}

function rotate_left() { // like rotating right but 
  valid_move = true
  validmove2 = true

  if (b == 0) {b = 4} // this serves as modulo

  for (let t = 0; t <= setBlocks.length - 1; t ++) {

  if (
  (BLOCKS[a][b - 1][0].y == setBlocks[t].y && BLOCKS[a][b - 1][0].x == setBlocks[t].x) ||
  (BLOCKS[a][b - 1][1].y == setBlocks[t].y && BLOCKS[a][b - 1][1].x == setBlocks[t].x) ||
  (BLOCKS[a][b - 1][2].y == setBlocks[t].y && BLOCKS[a][b - 1][2].x == setBlocks[t].x) ||
  (BLOCKS[a][b - 1][3].y == setBlocks[t].y && BLOCKS[a][b - 1][3].x == setBlocks[t].x)
  ){valid_move = false; break}}

  if(BLOCKS[a][b - 1][0].x == 11 ||
     BLOCKS[a][b - 1][1].x == 11 ||
     BLOCKS[a][b - 1][2].x == 11 ||
     BLOCKS[a][b - 1][3].x == 11
  )
    {
      for (let t = 0; t <= setBlocks.length - 1; t ++) {
        if (
          (BLOCKS[a][b - 1][0].y == setBlocks[t].y && BLOCKS[a][b - 1][0].x - 1 == setBlocks[t].x) ||
          (BLOCKS[a][b - 1][1].y == setBlocks[t].y && BLOCKS[a][b - 1][1].x - 1 == setBlocks[t].x) ||
          (BLOCKS[a][b - 1][2].y == setBlocks[t].y && BLOCKS[a][b - 1][2].x - 1 == setBlocks[t].x) ||
          (BLOCKS[a][b - 1][3].y == setBlocks[t].y && BLOCKS[a][b - 1][3].x - 1 == setBlocks[t].x)
          ){valid_move = false; break}
        if (a == 3 && b == 3 && (
          (BLOCKS[a][b - 1][0].y == setBlocks[t].y && BLOCKS[a][b - 1][0].x - 2 == setBlocks[t].x) ||
          (BLOCKS[a][b - 1][1].y == setBlocks[t].y && BLOCKS[a][b - 1][1].x - 2 == setBlocks[t].x) ||
          (BLOCKS[a][b - 1][2].y == setBlocks[t].y && BLOCKS[a][b - 1][2].x - 2 == setBlocks[t].x) ||
          (BLOCKS[a][b - 1][3].y == setBlocks[t].y && BLOCKS[a][b - 1][3].x - 2 == setBlocks[t].x)
          )){validmove2 = false; valid_move = false; break}
      }
      if (valid_move) {left_move()}
      if (a == 3 && b == 3 && validmove2 && valid_move) {left_move()}
    }
  if(BLOCKS[a][b - 1][0].x == 0 ||
     BLOCKS[a][b - 1][1].x == 0 ||
     BLOCKS[a][b - 1][2].x == 0 ||
     BLOCKS[a][b - 1][3].x == 0
  )
    {
      for (let t = 0; t <= setBlocks.length - 1; t ++) {
        if (
          (BLOCKS[a][b - 1][0].y == setBlocks[t].y && BLOCKS[a][b - 1][0].x + 1 == setBlocks[t].x) ||
          (BLOCKS[a][b - 1][1].y == setBlocks[t].y && BLOCKS[a][b - 1][1].x + 1 == setBlocks[t].x) ||
          (BLOCKS[a][b - 1][2].y == setBlocks[t].y && BLOCKS[a][b - 1][2].x + 1 == setBlocks[t].x) ||
          (BLOCKS[a][b - 1][3].y == setBlocks[t].y && BLOCKS[a][b - 1][3].x + 1 == setBlocks[t].x)
          ){valid_move = false; break}
        if (a == 3 && b == 1 && (
          (BLOCKS[a][b - 1][0].y == setBlocks[t].y && BLOCKS[a][b - 1][0].x + 2 == setBlocks[t].x) ||
          (BLOCKS[a][b - 1][1].y == setBlocks[t].y && BLOCKS[a][b - 1][1].x + 2 == setBlocks[t].x) ||
          (BLOCKS[a][b - 1][2].y == setBlocks[t].y && BLOCKS[a][b - 1][2].x + 2 == setBlocks[t].x) ||
          (BLOCKS[a][b - 1][3].y == setBlocks[t].y && BLOCKS[a][b - 1][3].x + 2 == setBlocks[t].x)
          )){validmove2 = false; valid_move = false; break}
      }
      if (valid_move) {right_move()}
      if (a == 3 && b == 1 && validmove2 && valid_move) {right_move()}
    }

  if(valid_move && !done && !end){
    b = b - 1
    draw()}
}

async function left_move() {
  valid_move = true

  for (let t = 0; t <= setBlocks.length - 1; t ++) {

  if (
  (BLOCKS[a][b][0].y == setBlocks[t].y && BLOCKS[a][b][0].x - 1 == setBlocks[t].x) ||
  (BLOCKS[a][b][1].y == setBlocks[t].y && BLOCKS[a][b][1].x - 1 == setBlocks[t].x) ||
  (BLOCKS[a][b][2].y == setBlocks[t].y && BLOCKS[a][b][2].x - 1 == setBlocks[t].x) ||
  (BLOCKS[a][b][3].y == setBlocks[t].y && BLOCKS[a][b][3].x - 1 == setBlocks[t].x)
  ){valid_move = false; break}}

  if (valid_move && !done && !end) {
      if(BLOCKS[a][b][0].x - 1 != 0 &&
         BLOCKS[a][b][1].x - 1 != 0 &&
         BLOCKS[a][b][2].x - 1 != 0 &&
         BLOCKS[a][b][3].x - 1 != 0){

          for (let e = 0; e <= 3; e++){
              for (let f = 0; f <= 3; f++){
      
              BLOCKS[a][e][f].x = BLOCKS[a][e][f].x - 1 // change x by -1 for all rotations
      
              }
          }
      }
  draw()
  }
  await sleep(150)
  if (keys.l || keys.a) {left_move()}
}

function down_hard() {
  for (let v = 0; v <= 3; v++) {
    BLOCKS[a][b][v].y = shadow[v].style.gridRowStart - 1
  }
  pop.play() // play the pop sound
  speed = 10000
  score += 30
}

async function hold_() {
  if (hold == 0){ // is set to 1 if its already been pressed once, so that you can't keep switching the same 2 pieces
    if (actual_first_hold){
      for (let n = 0;n <= 3; n++){ // create the hold piece using the current blocks style and shape
        const BlockHold = document.createElement('div')
        if (a == 5) { BlockHold.style.gridRowStart = co[a][0][n].y - 4 // displays the O block centered
                      BlockHold.style.gridColumnStart = co[a][0][n].x - 3}
        else {
          BlockHold.style.gridRowStart = co[a][0][n].y - 4
          BlockHold.style.gridColumnStart = co[a][0][n].x - 4
        }
        BlockHold.classList.add(styles[a])
        visHold.push(BlockHold)
        holdBoard.appendChild(BlockHold)
        visibleBlock[n].remove() // remove current block and its shadow
        shadow[n].remove()
      }
      actual_first_hold = false
      first_hold = true // this is for the spawn function (I couldn't find a better solution)

    } else { // if its not the first piece to be held, remove the old one
      first_hold = false
      for (let n = 0;n <= 3; n++){
          visHold[n].remove() // <--
      }
      for (let n = 0;n <= 3; n++){
          visHold.splice(0, 1) // <--
      }

      for (let n = 0;n <= 3; n++){
        const BlockHold = document.createElement('div')
        if (a == 5) { BlockHold.style.gridRowStart = co[a][0][n].y - 4
                      BlockHold.style.gridColumnStart = co[a][0][n].x - 3}
        else {
          BlockHold.style.gridRowStart = co[a][0][n].y - 4
          BlockHold.style.gridColumnStart = co[a][0][n].x - 4
        }
        BlockHold.classList.add(styles[a])
        visHold.push(BlockHold)
        holdBoard.appendChild(BlockHold)
        visibleBlock[n].remove()
        shadow[n].remove()
      }
    }

    held_a.push(a) // push the current a to use when re-spawning the held block

    for (let e = 0; e <= 3; e++){ // reset BLOCKS
      cBlok.pop()
      for (let f = 0; f <= 3; f++){
      BLOCKS[a][e][f].x = co[a][e][f].x
      BLOCKS[a][e][f].y = co[a][e][f].y
      }
    }

    done = true // to spawn a new block
    pressed_hold = true
    hold = 1
    speed = 10000 // setting speed to something high, so that the next frame gets rendered faster
  }
}

let valid_move = true // turns false when an input would hit a set block

let keys = { // defining key states to be able to use multiple inputs at once
  
  u: false,
  l: false,
  r: false,

  w: false,
  a: false,
  d: false,

  z: false,
  h: false,

  c: false
}

let mul = 5

window.addEventListener('keydown', e => {

    // if a key is down, set the keystate to true
    if (e.key === 'ArrowUp') {
        keys.u = true
    }
    if(e.key === 'ArrowDown'){
        speed = localStorage.difficulty * mul // except for the soft drop, here the speed is just increased
        if (mul < 12)
          mul += 2
      }
    if (e.key === 'ArrowLeft') {
        keys.l = true
    }
    if (e.key === 'ArrowRight') {
        keys.r = true
    }
    if (e.key === 'w') {
        keys.w = true
    }
    if(e.key === 's'){
      speed = localStorage.difficulty * mul // except for the soft drop, here the speed is just increased
      if (mul < 12)
        mul += 2
    }
    if (e.key === 'a') {
        keys.a = true
    }
    if (e.key === 'd') {
        keys.d = true
    }
    if (e.key === 'z') {
        keys.z = true
    }
    if (e.key === '#') {
        keys.h = true
    }
    if (e.key === 'c') {
        keys.c = true
    }

    if (keys.u || keys.w) { // rotate right
      rotate_right()
    }

    if (keys.h || keys.z) { // rotate left
      rotate_left()
    }

    if (keys.l || keys.a) { // move piece left
      left_move()
    }

    if (keys.r || keys.d) { // move piece right
      right_move()
    }

    if (keys.c && !end) { // change/ hold current piece
      hold_()
    }
  })

  addEventListener("keyup", (event) => { // on release set the keystates to false again
    if (event.key === "a") {
        keys.a = false;
    }
    if (event.key === "w") {
        keys.w = false;
    }
    if (event.key === "d") {
        keys.d = false;
    }
    if (event.key === "ArrowUp") {
        keys.u = false;
    }
    if (event.key === "ArrowLeft") {
        keys.l = false;
    }
    if (event.key === "ArrowRight") {
        keys.r = false;
    }
    if (event.key === "z") {
        keys.z = false;
    }
    if (event.key === "#") {
        keys.h = false;
    }
    if (event.key === "c") {
        keys.c = false;
    }
  })

  const pop = document.getElementById('pop') // see tetris.html (audio.js for the main theme)

  window.addEventListener('keypress', function (e) { // on hard drop, replace the blocks position with the shadow's
    if ((e.key === ' ' || e.key === 'Enter') && !end) {
      down_hard()
    }    
  })

  window.addEventListener('keyup', e => { // when releasing softdrop keys, slow down again
    switch (e.key) {
      case 'ArrowDown':
        speed = localStorage.difficulty
        mul = 5
        break
      case 's':
        speed = localStorage.difficulty
        mul = 5
        break
    }
  })

  const right = document.getElementById('right')

  right.addEventListener('click', function() {
    rotate_right()
  })

  const rightm = document.getElementById('rightm')

  rightm.addEventListener('click', function() {
    right_move()
  })

  const left = document.getElementById('left')

  left.addEventListener('click', function() {
    rotate_left()
  })

  const leftm = document.getElementById('leftm')

  leftm.addEventListener('click', function() {
    left_move()
  })

  const down = document.getElementById('down')

  down.addEventListener('touchstart', function() {
    speed = 5 * localStorage.difficulty
  })

  down.addEventListener('touchend', function() {
    speed = localStorage.difficulty
  })

  down.addEventListener('mousedown', function() {
    speed = 5 * localStorage.difficulty
  })

  down.addEventListener('mouseup', function() {
    speed = localStorage.difficulty
  })

  const downh = document.getElementById('downh')

  downh.addEventListener('click', function() {
    down_hard()
  })

  const holdd = document.getElementById('hold')

  holdd.addEventListener('click', function() {
    hold_()
  })

  const back = document.getElementById('back');

  back.addEventListener('click', function() {

    if (score > localStorage.highscore || localStorage.highscore === undefined) {
        localStorage.highscore = score
    }
    window.location.replace("menu.html");
  })
