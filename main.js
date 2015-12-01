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
// Storing whether or not a key is already pressed
var pressed = false;
var coins = [];

function preload () {
  game.load.spritesheet('chicken', 'assets/chicken.png', 58, 75);
  game.load.image('coin', 'assets/coin.png');
  game.load.image('grass-light', 'assets/grass-light.png');
  game.load.image('grass-dark', 'assets/grass-dark.png');
  game.load.image('road-lines', 'assets/road-lines.png');
  game.load.image('road-no-lines', 'assets/road-no-lines.png');
  game.load.spritesheet('car-yellow', 'assets/car-yellow.png', 240, 192);
  game.load.spritesheet('car-purple', 'assets/car-purple.png', 240, 192);
  game.load.spritesheet('car-orange', 'assets/car-orange.png', 240, 192);
  game.load.spritesheet('car-green', 'assets/car-green.png', 240, 192);
  game.load.spritesheet('car-blue', 'assets/car-blue.png', 180, 192);
  game.load.image('tree-small', 'assets/tree-small.png');
  game.load.image('tree-medium', 'assets/tree-medium.png');
  game.load.image('tree-large', 'assets/tree-large.png');
}

function create () {
  // Ground
  var grass = game.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 48, 'grass-light');
  grass.anchor.setTo(0.5, 0.5);
  var road = game.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 96, 'road-no-lines');
  road.anchor.setTo(0.5, 1.0);
  road = game.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 96 * 2, 'road-lines');
  road.anchor.setTo(0.5, 1.0);
  road = game.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 96 * 3, 'road-lines');
  road.anchor.setTo(0.5, 1.0);
  grass = game.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 96 * 4, 'grass-light');
  grass.anchor.setTo(0.5, 1.0);
  road = game.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 96 * 5, 'road-no-lines');
  road.anchor.setTo(0.5, 1.0);

  // Coins
  var coin = game.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 96 * 2, 'coin');
  coin.anchor.setTo(0.5, 1.0);
  coins.push(coin);

  chicken = game.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 48, 'chicken');
  chicken.anchor.setTo(0.5, 0.5);
  chicken.frame = 0;

  // Cars
  var car = game.add.sprite(0, 0, 'car-blue');
  car.anchor.setTo(0, 0.5);
  car.frame = 0;
  car = game.add.sprite(GAME_WIDTH - 4 * 60, GAME_HEIGHT - 96, 'car-green');
  car.anchor.setTo(0, 1.0);
  car.frame = 1;

  // Trees
  var tree = game.add.sprite(GAME_WIDTH - 120 * 2, 192, 'tree-large');
  tree.anchor.setTo(0, 1.0);
  tree = game.add.sprite(GAME_WIDTH - 120, 192, 'tree-large');
  tree.anchor.setTo(0, 1.0);
  tree = game.add.sprite(60, 192, 'tree-small');
  tree.anchor.setTo(0, 1.0);
  tree = game.add.sprite(0, GAME_HEIGHT, 'tree-large');
  tree.anchor.setTo(0, 1.0);
  tree = game.add.sprite(GAME_WIDTH - 180, GAME_HEIGHT, 'tree-medium');
  tree.anchor.setTo(0, 1.0);

  car = game.add.sprite(0, 96 * 3, 'car-orange');
  car.anchor.setTo(0, 1.0);
  car.frame = 1;

  // Game controls
  cursors = game.input.keyboard.createCursorKeys();
}

var hopForward = function () {
  chicken.frame = 0;
  var tween_1 = game.add.tween(chicken);
  tween_1.to({
    y: chicken.y - 104
  }, 250, Phaser.Easing.Quadratic.Out);
  var tween_2 = game.add.tween(chicken);
  tween_2.to({
    y: chicken.y - 96
  }, 150, Phaser.Easing.Quadratic.In);
  tween_1.chain(tween_2);
  tween_1.start();

  // Only allow user to press key when tween is complete
  tween_2.onComplete.add(function () {
    pressed = false;
  });
};

var hopBack = function () {
  chicken.frame = 3;
  var tween_1 = game.add.tween(chicken);
  tween_1.to({
    y: chicken.y + 104
  }, 250, Phaser.Easing.Quadratic.Out);
  var tween_2 = game.add.tween(chicken);
  tween_2.to({
    y: chicken.y + 96
  }, 150, Phaser.Easing.Quadratic.In);
  tween_1.chain(tween_2);
  tween_1.start();

  tween_2.onComplete.add(function () {
    pressed = false;
  });
};

var hopLeft = function () {
  chicken.frame = 1;
  var tween_1 = game.add.tween(chicken);
  tween_1.to({
    x: chicken.x - 30,
    y: chicken.y - 8
  }, 150, Phaser.Easing.Quadratic.Out);
  var tween_2 = game.add.tween(chicken);
  tween_2.to({
    x: chicken.x - 60,
    y: chicken.y
  }, 150, Phaser.Easing.Quadratic.In);
  tween_1.chain(tween_2);
  tween_1.start();

  tween_2.onComplete.add(function () {
    pressed = false;
  });
};

var hopRight = function () {
  chicken.frame = 2;
  var tween_1 = game.add.tween(chicken);
  tween_1.to({
    x: chicken.x + 30,
    y: chicken.y - 8
  }, 150, Phaser.Easing.Quadratic.Out);
  var tween_2 = game.add.tween(chicken);
  tween_2.to({
    x: chicken.x + 60,
    y: chicken.y
  }, 100, Phaser.Easing.Quadratic.In);
  tween_1.chain(tween_2);
  tween_1.start();

  tween_2.onComplete.add(function () {
    pressed = false;
  });
};

function update () {
  // Check if chicken collided with coin
  for(var i = 0; i < coins.length; i++) {
    var coin = coins[i];
    if(Phaser.Rectangle.intersects(chicken.getBounds(), coin.getBounds())) {
      coins.splice(i, 1);

      // Fade coin out
      var tween = game.add.tween(coin);
      tween.to({
        alpha: 0
      }, 500, Phaser.Easing.Quadratic.Out);
      tween.onComplete.add(function () {
        coin.kill();

        // Check if all coins have been collected
        if (coins.length == 0) {
          game.lockRender = true;
          alert('Level complete!');
        }
      });
      tween.start();
    }
  }

  // Revive this code later
  // Only check for key events if a key is not already being pressed
  /*if (!pressed) {
    if (cursors.up.isDown) {
      pressed = true;
      hopForward();
    }
    else if (cursors.down.isDown) {
      pressed = true;
      hopBack();
    }
    else if (cursors.left.isDown) {
      pressed = true;
      hopLeft();
    }
    else if (cursors.right.isDown) {
      pressed = true;
      hopRight();
    }
  }*/
}