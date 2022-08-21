const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

var engine, world, backgroundImg;
var canvas, angle, tower, ground, cannon;
var balls = [];
var boats = [];
var score = 0;
var boatAnimation = [];
var boatSpritedata, boatSpritesheet;
var isGameover = false
var isLaughing = false
var score = 0
var collision

var brokenBoatAnimation = [];
var brokenBoatSpritedata, brokenBoatSpritesheet;

var waterSplashAnimation = [];
var waterSplashSpritedata, waterSplashSpritesheet;

function preload() {
  backgroundImg = loadImage("./assets/background.jpg");
  towerImage = loadImage("./assets/tower.png");
  boatSpritedata = loadJSON("assets/boat/boat.json");
  boatSpritesheet = loadImage("assets/boat/boat.png");
  brokenBoatSpritedata = loadJSON("assets/boat/broken_boat.json");
  brokenBoatSpritesheet = loadImage("assets/boat/broken_boat.png");
  waterSplashSpritedata = loadJSON("assets/water_splash/water_splash.json");
  waterSplashSpritesheet = loadImage("assets/water_splash/water_splash.png");
  pirateLaughSound = loadSound("assets/pirare_laugh.mp3")
  waterSound = loadSound("/assets/cannon_water.mp3")
  backgroundMusic = loadSound("/assets/background_music.mp3")
  cannonExplosion = loadSound("/assets/cannon_explosion.mp3")
}

function setup() {
  canvas = createCanvas(1200, 600);
  engine = Engine.create();
  world = engine.world;
  angleMode(DEGREES)
  angle = 15


  ground = Bodies.rectangle(0, height - 1, width * 2, 1, { isStatic: true });
  World.add(world, ground);

  tower = Bodies.rectangle(160, 350, 160, 310, { isStatic: true });
  World.add(world, tower);

  cannon = new Cannon(180, 130, 130, 100, angle);

  var boatFrames = boatSpritedata.frames;
  for (var i = 0; i < boatFrames.length; i++) {
    var pos = boatFrames[i].position;
    var img = boatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }

  var brokenBoatFrames = brokenBoatSpritedata.frames;
  for (var i = 0; i < brokenBoatFrames.length; i++) {
    var pos = brokenBoatFrames[i].position;
    var img = brokenBoatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    brokenBoatAnimation.push(img);
  }

  var waterSplashFrames = waterSplashSpritedata.frames;
  for (var i = 0; i < waterSplashFrames.length; i++) {
    var pos = waterSplashFrames[i].position;
    var img = waterSplashSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    waterSplashAnimation.push(img);
  }
}

function draw() {
  background(189);
  image(backgroundImg, 0, 0, width, height);
  if (!backgroundMusic.isPlaying()){
    backgroundMusic.play()
    backgroundMusic.setVolume(0.1)
  }

  Engine.update(engine);

  push();
  translate(ground.position.x, ground.position.y);
  fill("brown");
  rectMode(CENTER);
  rect(0, 0, width * 2, 1);
  pop();

  push();
  translate(tower.position.x, tower.position.y);
  rotate(tower.angle);
  imageMode(CENTER);
  image(towerImage, 0, 0, 220, 350); //changes made here
  pop();

  showBoats();

  for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    collisionWithBoat(i);
  }

  cannon.display();

  
}


function collisionWithBoat(index) {
  for (var i = 0; i < boats.length; i++) {
    if (balls[index] !== undefined && boats[i] !== undefined) {
      var collision = Matter.SAT.collides(balls[index].body, boats[i].body); //collision 


      if (collision.collided) {
          score = score + 5    //after every collision, score is incremented by 5
          boats[i].remove(i); //here the boat is getting removed from the world
        

        Matter.World.remove(world, balls[index].body); //herer the balls are getting removed
        delete balls[index]; //deleting...
      }
    }
  }
}


function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
  }
}

function showCannonBalls(ball, index) {
  if (ball) {
    ball.display();
    ball.animate();
    if (ball.body.position.x >= width || ball.body.position.y >= height - 50) {
      if (!ball.isSink){
        waterSound.play()
        ball.remove(index)  
      }
        
      
    }
  }
}

function showBoats() {
  if (boats.length > 0) {
    if (
      boats[boats.length - 1] === undefined ||
      boats[boats.length - 1].body.position.x < width - 300
    ) {
      var positions = [-70, -90, -100, -50]; //changes made
      var position = random(positions);
      var boat = new Boat(
        width,
        height - 100,
        170,
        170,
        position,
        boatAnimation
      );

      boats.push(boat);
    }

    for (var i = 0; i < boats.length; i++) {
      if (boats[i]) {
        Matter.Body.setVelocity(boats[i].body, {
          x: -0.9,
          y: 0
        });

        boats[i].display();
        boats[i].animate();
        collision = Matter.SAT.collides(this.tower,boats[i].body); //this checks if the boat collides with the tower
        if (collision.collided && !boats[i].isBroken) //if the boat is not broken and collides with the tower
        {
          if (! isLaughing && !pirateLaughSound.isPlaying()){ // if the laugh sound isnt playing then play and 'isLaughing=true'
            pirateLaughSound.play()
            isLaughing = true
          }
          isGameover = true; //here the game is over
          gameOver();
        }
        
    }
    }
  } else {
    var boat = new Boat(width, height - 60, 170, 170, -60, boatAnimation);
    boats.push(boat);
  }
}

function keyReleased() {
  if (keyCode === DOWN_ARROW) {
    cannonExplosion.play()
    balls[balls.length - 1].shoot();
  }
}

function gameOver() {
    swal(               //sweet alert
    {
      title : `Game over!!!`, //HTML always use ``
      text : `Thank for playing!`, 
      imageUrl : "https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png", //for url use ""
      imageSize : "150x150",
      confirmButtonText : "Play again" //button

    },
    function (isConfirm){
      if (isConfirm){
        location.reload() //location means that it will start from beginning
      }
    }
    )





}