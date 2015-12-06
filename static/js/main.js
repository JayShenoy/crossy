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
// Initial chicken position for reset
var chickenPosition;
var chickenDead = false;
var cursors;
// Storing whether or not a key is already pressed
var pressed = false;
var coins = [];
var numCoins = 0;
var cars = [];
var trees = [];
// Group for depth sort
var group;
var waterRows = [];
var logs = [];
// Water overlay for sinking effect
var waterOverlay;

function preload () {
  game.load.spritesheet('chicken', '/crossyAsset/chicken.png', 58, 75);
  game.load.image('coin', '/crossyAsset/coin.png');
  game.load.image('grass-light', '/crossyAsset/grass-light.png');
  game.load.image('grass-dark', '/crossyAsset/grass-dark.png');
  game.load.image('road-lines', '/crossyAsset/road-lines.png');
  game.load.image('road-no-lines', '/crossyAsset/road-no-lines.png');
  game.load.spritesheet('car-yellow', '/crossyAsset/car-yellow.png', 240, 192);
  game.load.spritesheet('car-purple', '/crossyAsset/car-purple.png', 240, 192);
  game.load.spritesheet('car-orange', '/crossyAsset/car-orange.png', 240, 192);
  game.load.spritesheet('car-green', '/crossyAsset/car-green.png', 240, 192);
  game.load.spritesheet('car-blue', '/crossyAsset/car-blue.png', 180, 192);
  game.load.image('tree-small', '/crossyAsset/tree-small.png');
  game.load.image('tree-medium', '/crossyAsset/tree-medium.png');
  game.load.image('tree-large', '/crossyAsset/tree-large.png');
  game.load.image('water', '/crossyAsset/water.png');
  game.load.image('lily-pad', '/crossyAsset/lily-pad.png');
  game.load.image('log-small', '/crossyAsset/log-small.png');
  game.load.image('log-large', '/crossyAsset/log-large.png');
  game.load.spritesheet('splash', '/crossyAsset/splash.png', 60, 96);
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
      waterRows.push(water);
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
          var log = group.create(j * 60 + 60, i * 96 + 48, 'log-small');
          log.anchor.setTo(0.5);
          logs.push(log);
        }
        else if(objects[key] === 'log-large') {
          var log = group.create(j * 60 + 150, i * 96 + 48, 'log-large');
          log.anchor.setTo(0.5);
          logs.push(log);
        }
        else if(objects[key] === 'coin') {
          var coin = group.create(j * 60 + 30, i * 96 + 48, 'coin');
          coin.anchor.setTo(0.5);
          // Add "collected" attribute
          coin.collected = false;
          coins.push(coin);
          numCoins++;
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
        chickenDead = true;

        setTimeout(function() {
          $('#modalContent').html('You hit a car! Give it another shot.<br><br><button type="button" class="btn btn-primary" data-dismiss="modal">Try Again</button>');
          $('#myModal').modal();
        }, 800);
      }
    }
  }
};

var checkWaterCollision = function() {
  for(var i = 0; i < waterRows.length; i++) {
    var water = waterRows[i];
    // If chicken is on water
    if(Phaser.Rectangle.intersects(chicken.getBounds(), water.getBounds())) {
      // Check if chicken is on top of log
      for(var j = 0; j < logs.length; j++) {
        var log = logs[j];
        // If log is on this row of water
        if(log.y == water.y + 48) {
          if(!Phaser.Rectangle.intersects(chicken.getBounds(), log.getBounds())) {
            chickenDead = true;

            // Overlaying water to give the appearance of sinking
            waterOverlay = game.add.sprite(chicken.x, water.y + 96, 'splash');
            waterOverlay.anchor.setTo(0.5, 1.0);
            var sinkingAnimation = waterOverlay.animations.add('sink');
            waterOverlay.animations.play('sink', 20);

            setTimeout(function() {
              $('#modalContent').html('Looks like you sunk! Give it another shot.<br><br><button type="button" class="btn btn-primary" data-dismiss="modal">Try Again</button>');
              $('#myModal').modal();
            }, 800);
          }
          else {
            console.log('Log ' + j + ' Bounds: ' + log.getBounds());
            console.log('Chicken: ' + chicken.getBounds());
            console.log(Phaser.Rectangle.intersects(chicken.getBounds(), log.getBounds()));
          }
        }
      }

      // Return because chicken cannot be on any other row
      return;
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
    checkWaterCollision();
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
    checkWaterCollision();
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
    x: chicken.x - 58,
    y: chicken.y - 8
  }, 150, Phaser.Easing.Quadratic.Out);
  var tween_2 = game.add.tween(chicken);
  tween_2.to({
    x: chicken.x - 60,
    y: chicken.y
  }, 100, Phaser.Easing.Quadratic.In);
  tween_1.chain(tween_2);
  tween_1.start();

  tween_2.onComplete.add(function () {
    pressed = false;
    checkCarCollision();
    checkWaterCollision();
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
    x: chicken.x + 58,
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
    checkWaterCollision();
  });
};

var gameReset = function () {
  // Reset chicken
  chicken.frame = 0;
  chickenDead = false;
  chicken.x = chickenPosition[0];
  chicken.y = chickenPosition[1];

  // Remove water overlay
  if(waterOverlay instanceof Phaser.Sprite) {
    waterOverlay.destroy();
  }

  // Delay to avoid collisions with chicken
  setTimeout(function() {
    for(var i = 0; i < coins.length; i++) {
      coins[i].alpha = 1;
      coins[i].collected = false;
    }
    numCoins = coins.length;
  }, 20);
};

function update () {
  // Check if chicken collided with coin
  for(var i = 0; i < coins.length; i++) {
    var coin = coins[i];
    // Only check coins that have not already been collected
    if(!coin.collected) {
      if(Phaser.Rectangle.intersects(chicken.getBounds(), coin.getBounds())) {
        coin.collected = true;
        numCoins--;
        // Fade coin out
        var tween = game.add.tween(coin);
        tween.to({
          alpha: 0
        }, 500, Phaser.Easing.Quadratic.Out);
        tween.onComplete.add(function () {
          // Check if all coins have been collected
          if (numCoins == 0) {
            // Generate code
            Blockly.JavaScript.STATEMENT_PREFIX = '';
            var code = Blockly.JavaScript.workspaceToCode(workspace);
            // Convert JavaScript special characters to HTML
            code = code.replace(new RegExp('\r?\n', 'g'), '<br>');

            // Check that repeat block was used if level 5 or 6
            if((level == '5' || level == '7') && code.indexOf('for') == -1) {
              $('#modalContent').html('You collected the coin, but try solving the level again using the repeat block.<br><br><button type="button" class="btn btn-primary" data-dismiss="modal">Try Again</button>');
              $('#myModal').modal();
            }
            else {
              // Store level completion in local storage
              if(sessionStorage.progress) {
                var progress = JSON.parse(sessionStorage.progress);
                progress.completedLevels.push(level);
                sessionStorage.progress = JSON.stringify(progress);
              }
              else {
                // Create new progress object to store completed levels
                var progress = {
                  'completedLevels': [level]
                }
                sessionStorage.progress = JSON.stringify(progress);
              }
              // Fill in circle corresponding to current level
              var $circle = $('#circle' + level);
              $circle.attr('fill', '#E6C35A');

              $('#modalContent').html('Level complete! You wrote the following code:<br><br>' + code + '<br><a href="/crossy/' + (parseInt(level) + 1) + '" role="button" class="btn btn-success">Next</button>');
              $('#myModal').modal();
            }
          }
        });
        tween.start();
      }
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