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

// Load map from JSON
var map;
$.getJSON('maps/2.json', function(data) {
  map = data.layout;
});

var chicken;
// Initial chicken position for reset
var chickenPosition;
var cursors;
// Storing whether or not a key is already pressed
var pressed = false;
var coins = [];
// Coin positions for reset
var coinPositions = [];
var cars = [];
var trees = [];
// Group for depth sort
var group;

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
  for(var i = 0; i < map.length; i++) {
    var row = map[i];

    if(row.type === 'road') {
      // Draw road without lines if bottom row or row below is not road
      if(i == map.length - 1 || map[i + 1].type !== 'road') {
        var road = game.add.sprite(GAME_WIDTH / 2, i * 96, 'road-no-lines');
        road.anchor.setTo(0.5, 0);
      }
      else {
        var road = game.add.sprite(GAME_WIDTH / 2, i * 96, 'road-lines');
        road.anchor.setTo(0.5, 0);
      }
    }
    else if(row.type === 'grass') {
      // Draw light grass if no grass above or dark grass above, or if top row
      if(i == 0 || (map[i - 1].type !== 'grass' && map[i - 1].type !== 'grass-dark') || map[i - 1].type === 'grass-dark') {
        var grass = game.add.sprite(GAME_WIDTH / 2, i * 96, 'grass-light');
        grass.anchor.setTo(0.5, 0);
      }
      else {
        var grass = game.add.sprite(GAME_WIDTH / 2, i * 96, 'grass-dark');
        grass.anchor.setTo(0.5, 0);
        map[i].type = 'grass-dark';
      }
    }
    else if(row.type === 'water') {
      var water = game.add.sprite(GAME_WIDTH / 2, i * 96, 'water');
      water.anchor.setTo(0.5, 0);
    }
  }

  group = game.add.group();

  // Objects on ground
  for(var i = 0; i < map.length; i++) {
    var row = map[i];

    if('objects' in row) {
      var objects = row.objects;

      // Iterate through objects
      for(var key in objects) {
        // Column position
        var j = parseInt(key);

        if(objects[key] === 'car-blue') {
          var car = group.create(j * 60 + 90, i * 96, 'car-blue');
          car.anchor.setTo(0.5);

          // Determine car direction
          if('direction' in row && row.direction === 'left') {
            car.frame = 0;
          }
          else {
            car.frame = 1;
          }
          cars.push(car);
        }
        // Any other type of car
        else if(objects[key].indexOf('car') > -1) {
          var car = group.create(j * 60 + 120, i * 96, objects[key]);
          car.anchor.setTo(0.5);

          // Determine car direction
          if('direction' in row && row.direction === 'left') {
            car.frame = 0;
          }
          else {
            car.frame = 1;
          }
          cars.push(car);
        }
        else if(objects[key].indexOf('tree') > -1) {
          var tree = group.create(j * 60 + 60, i * 96, objects[key]);
          tree.anchor.setTo(0.5);
          trees.push(tree);
        }
        else if(objects[key] === 'lily-pad') {
          var pad = group.create(j * 60 + 30, i * 96 + 48, 'lily-pad');
          pad.anchor.setTo(0.5);
        }
        else if(objects[key] === 'log-small') {
          var log = group.create(j * 60 + 90, i * 96 + 48, 'log-small');
          log.anchor.setTo(0.5);
        }
        else if(objects[key] === 'log-large') {
          var log = group.create(j * 60 + 150, i * 96 + 48, 'log-large');
          log.anchor.setTo(0.5);
        }
        else if(objects[key] === 'coin') {
          var coin = group.create(j * 60 + 30, i * 96 + 48, 'coin');
          coin.anchor.setTo(0.5);
          coins.push(coin);
          coinPositions.push([j * 60 + 30, i * 96 + 48]);
        }
        else if(objects[key] === 'chicken') {
          chicken = group.create(j * 60 + 30, i * 96 + 86, 'chicken');
          chicken.anchor.setTo(0.5, 1.0);
          chickenPosition = [j * 60 + 30, i * 96 + 86];
        }
      }
    }
  }

  group.sort();

  // Game controls
  cursors = game.input.keyboard.createCursorKeys();
}

var checkCarCollision = function () {
  for(var i = 0; i < cars.length; i++) {
    var car = cars[i];

    // Make sure that chicken isn't "colliding" with top of car
    if(Phaser.Rectangle.intersects(chicken.getBounds(), car.getBounds())) {
      if(chicken.y >= car.y) {
        chicken.frame = 4;
        setTimeout(function () {
          alert('Give it another shot. Make sure to collect all the coins!');
        }, 800);
      }
    }
  }
};

var hopForward = function () {
  chicken.frame = 0;

  // Don't hop if chicken will land on tree
  for(var i = 0; i < trees.length; i++) {
    var tree = trees[i];

    // Tree coordinates for comparison purposes
    var treeX1 = tree.x - 60;
    var treeX2 = tree.x + 60;
    var treeY1 = tree.y;
    var treeY2 = tree.y + 96;

    if(chicken.x >= treeX1 && chicken.x <= treeX2 && chicken.y - 96 >= treeY1 && chicken.y - 96 <= treeY2) {
      return;
    }
  }

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
    checkCarCollision();
  });
};

var hopBack = function () {
  chicken.frame = 3;

  // Don't hop if chicken will land on tree
  for(var i = 0; i < trees.length; i++) {
    var tree = trees[i];

    // Tree coordinates for comparison purposes
    var treeX1 = tree.x - 60;
    var treeX2 = tree.x + 60;
    var treeY1 = tree.y;
    var treeY2 = tree.y + 96;

    if(chicken.x >= treeX1 && chicken.x <= treeX2 && chicken.y + 96 >= treeY1 && chicken.y + 96 <= treeY2) {
      return;
    }
  }

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
    checkCarCollision();
  });
};

var hopLeft = function () {
  chicken.frame = 1;

  // Don't hop if chicken will land on tree
  for(var i = 0; i < trees.length; i++) {
    var tree = trees[i];

    // Tree coordinates for comparison purposes
    var treeX1 = tree.x - 60;
    var treeX2 = tree.x + 60;
    var treeY1 = tree.y;
    var treeY2 = tree.y + 96;

    if(chicken.x - 60 >= treeX1 && chicken.x - 60 <= treeX2 && chicken.y >= treeY1 && chicken.y <= treeY2) {
      return;
    }
  }

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
    checkCarCollision();
  });
};

var hopRight = function () {
  chicken.frame = 2;

  // Don't hop if chicken will land on tree
  for(var i = 0; i < trees.length; i++) {
    var tree = trees[i];

    // Tree coordinates for comparison purposes
    var treeX1 = tree.x - 60;
    var treeX2 = tree.x + 60;
    var treeY1 = tree.y;
    var treeY2 = tree.y + 96;

    if(chicken.x + 60 >= treeX1 && chicken.x + 60 <= treeX2 && chicken.y >= treeY1 && chicken.y <= treeY2) {
      return;
    }
  }

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
    checkCarCollision();
  });
};

var gameReset = function () {
  // Pause game so it doesn't keep checking for coin collisions
  game.paused = true;

  // Reset chicken
  chicken.frame = 0;
  chicken.x = chickenPosition[0];
  chicken.y = chickenPosition[1];

  // Remove all coins
  for(var i = 0; i < coins.length; i++) {
    var coin = coins[i];
    coins.splice(i, 1);
    coin.kill();
  }

  // Reset coins
  for(var i = 0; i < coinPositions.length; i++) {
    var coinPos = coinPositions[i];
    var coin = group.create(coinPos[0], coinPos[1], 'coin');
    coin.anchor.setTo(0.5);
    coins.push(coin);
  }

  // Unpause game after a slight delay to avoid coin collision
  setTimeout(function() { game.paused = false; }, 100);
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

          // Generate code
          Blockly.JavaScript.STATEMENT_PREFIX = '';
          var code = Blockly.JavaScript.workspaceToCode(workspace);
          alert('Level complete! You wrote the following code:\n' + code);
        }
      });
      tween.start();
    }
  }

  // Depth sort
  group.sort('y', Phaser.Group.SORT_ASCENDING);

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