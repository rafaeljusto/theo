// size of the game in blocks (square)
var matrixSize = 1000;

// block size in pixels (square)
var blockSize = 50;

// possible status of a block
var blockStatus = {
  Free: 1,
  Mountain: 2,
  Tree: 3,
  Building: 4,
  Antenna: 5
};

// possible directions of the plane
var direction = {
  North: 1,
  South: 2,
  East: 3,
  West: 4,
};

// possible keypress codes
var keypressCode = {
  Left: 37,
  Up: 38,
  Right: 39,
  Down: 40,
};

var gameMatrix = [];

var visibleBlocks = {
  X: 0,
  Y: 0,
};

var currentPosition = {
  X: 0,
  Y: 0,
  direction: direction.North,
};

var gameTickerID = 0;

function initializeGameMatrix() {
  gameMatrix = [];

  for(var y = 0; y < matrixSize; y++) {
    var gameMatrixLine = [];
    for(var x = 0; x < matrixSize; x++) {
      // initializing matrix with random status
      var status = Math.floor((Math.random() * 20) + 1);

      // increase the probability of free
      if (status > 5) {
        status = blockStatus.Free;
      }

      gameMatrixLine.push(status);
    }
    gameMatrix.push(gameMatrixLine);
  }
}

function rotatePlane() {
  var gamePlane = $(".game-plane");
  switch (currentPosition.direction) {
    case direction.North:
      break;
    case direction.South:
      gamePlane.rotate(180);
      break;
    case direction.East:
      gamePlane.rotate(90);
      break;
    case direction.West:
      gamePlane.rotate(270);
      break;
  }
}

function drawGameMatrix() {
  var gameFrame = $(".game-frame");

  var newGameFrame = gameFrame.clone();
  newGameFrame.empty();

  for(var y = 0; y < visibleBlocks.Y; y++) {
    var gameFrameLine = $("<div class='game-line'>");
    for(var x = 0; x < visibleBlocks.X; x++) {
      var gameBlock = $("<div class='game-block'>");

      // current position always in the middle of the screen
      var deltaX = Math.floor(visibleBlocks.X / 2);
      var deltaY = Math.floor(visibleBlocks.Y / 2);

      var drawX = currentPosition.X - deltaX + x;
      var drawY = currentPosition.Y - deltaY + y;

      // safety checks
      if (gameMatrix.length <= drawY || gameMatrix[drawY].length <= drawX) {
        console.log("position (" + drawX + "," + drawY + ") is out of the matrix")
        continue;
      }

      switch(gameMatrix[drawY][drawX]) {
        case blockStatus.Mountain:
          gameBlock.append("<img class='game-block-mountain'>");
          break;
        case blockStatus.Tree:
          gameBlock.append("<img class='game-block-tree'>");
          break;
        case blockStatus.Building:
          gameBlock.append("<img class='game-block-building'>");
          break;
        case blockStatus.Antenna:
          gameBlock.append("<img class='game-block-antenna'>");
          break;
      }

      if (currentPosition.X == drawX && currentPosition.Y == drawY) {
        gameBlock.append("<img class='game-plane'>");
      }

      gameFrameLine.append(gameBlock);
    }

    newGameFrame.append(gameFrameLine);
  }

  gameFrame.replaceWith(newGameFrame);
  rotatePlane();
}

function gameTicker() {
  if (gameMatrix.length <= currentPosition.Y ||
      gameMatrix[currentPosition.Y].length <= currentPosition.X ||
      gameMatrix[currentPosition.Y][currentPosition.X] != blockStatus.Free) {
    // crash! lost game
    $(".game-plane").addClass("explosion");
    $(".game-restart").show();
    return;
  }

  switch (currentPosition.direction) {
    case direction.North:
      currentPosition.Y--;
      break;
    case direction.South:
      currentPosition.Y++;
      break;
    case direction.East:
      currentPosition.X++;
      break;
    case direction.West:
      currentPosition.X--;
      break;
  }

  drawGameMatrix();
  gameTickerID = setTimeout(gameTicker, 1000);
}

function changePlaneDirection(newDirection) {
  currentPosition.direction = newDirection;
  rotatePlane();
}

function initializeGame() {
  // defining the game-frame size
  var gameFrame = $(".game-frame");
  gameFrame.width($(document).width() - 100);
  gameFrame.height($(document).height() - 100);

  // calculating the number of blocks visible on the screen
  visibleBlocks.X = Math.floor(gameFrame.width() / blockSize);
  visibleBlocks.Y = Math.floor(gameFrame.height() / blockSize);

  // start at the middle of the scenario
  currentPosition.X = Math.floor(matrixSize/2);
  currentPosition.Y = Math.floor(matrixSize/2);

  initializeGameMatrix();
  while (gameMatrix[currentPosition.Y][currentPosition.X] != blockStatus.Free) {
    initializeGameMatrix();
  }

  drawGameMatrix();
}

function addEvents() {
  // detect actions with keyboard
  $(document).keydown(function(e) {
    switch (event.which) {
      case keypressCode.Left:
        changePlaneDirection(direction.West);
        break;
      case keypressCode.Up:
        changePlaneDirection(direction.North);
        break;
      case keypressCode.Right:
        changePlaneDirection(direction.East);
        break;
      case keypressCode.Down:
        changePlaneDirection(direction.South);
        break;
    }
  });

  // add actions to game controls
  $(".game-controls-up").click(function(e) {
    changePlaneDirection(direction.North);
  });
  $(".game-controls-down").click(function(e) {
    changePlaneDirection(direction.South);
  });
  $(".game-controls-left").click(function(e) {
    changePlaneDirection(direction.West);
  });
  $(".game-controls-right").click(function(e) {
    changePlaneDirection(direction.East);
  });

  // add restart action
  $(".game-restart").click(function(e) {
    initializeGame();
    $(".game-restart").hide();
    if (gameTickerID) {
      clearTimeout(gameTickerID);
    }
    gameTickerID = setTimeout(gameTicker, 1000);
  });

  // restart everything if window size changes
  $(window).on("resize", function(e) {
    initializeGame();
    $(".game-restart").hide();
    if (gameTickerID) {
      clearTimeout(gameTickerID);
    }
    gameTickerID = setTimeout(gameTicker, 1000);
  });

  gameTickerID = setTimeout(gameTicker, 1000);
}

$(function() {
  initializeGame();
  addEvents();
})