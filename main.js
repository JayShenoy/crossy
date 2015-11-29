GAME_WIDTH = 540;
GAME_HEIGHT = 576;

var game = new Phaser.Game(
  GAME_WIDTH,
  GAME_HEIGHT,
  Phaser.AUTO,
  'game',
  {
    preload: preload,
    create: create,
    update: update
  }
);

var chicken;
var cursors;

function preload () {
  game.load.spritesheet('chicken', 'assets/chicken.png', 60, 96);
}

function create () {
  chicken = game.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 48, 'chicken');
  chicken.anchor.setTo(0.5, 0.5);

  // Game controls
  cursors = game.input.keyboard.createCursorKeys();
}

var hopForward = function () {
  chicken.frame = 0;
};

var hopLeft = function () {
  chicken.frame = 1;
};

var hopRight = function () {
  chicken.frame = 2;
};

var hopBack = function () {
  chicken.frame = 3;
};

function update () {
  // Check for key events
  if(cursors.up.isDown) {
    hopForward();
  }
  else if(cursors.left.isDown) {
    hopLeft();
  }
  else if(cursors.right.isDown) {
    hopRight();
  }
  else if(cursors.down.isDown) {
    hopBack();
  }
  else {
    chicken.frame = 0;
  }
}