var bullets;
var asteroids;
var ship;
var tieFighter;
var shipImage, bulletImage, particleImage;
var MARGIN = 40;
var SCORE = 0;
var COUNTER = 0;
var END = false;
var FINAL_SCORE = 0;


//////////////////////////////


var xwingSound;
var screamSound;

// Board setup — you may need to change the port
var b = p5.board('/dev/cu.usbmodem1411', 'arduino');

// Test analog read
var p = b.pin(3, 'ANALOG', 'INPUT');

var y = b.pin(1, 'ANALOG', 'INPUT');

var P = 0;
var Y = 0;

SHOT = false;

p.read(function(val){P = parseInt(val / 3);});
y.read(function(val){Y = val;});


function preload() {
  xwingSound = loadSound('laser.wav');
  screamSound = loadSound('scream.wav');
}


//////////////////////////////

var video;

function setup() {

  createCanvas(3500,2000);

  video = createVideo('back.mov');
  video.loop();
  video.hide();
  video.volume(0);

  xwingSound.stop();
  screamSound.stop();

  bulletImage = loadImage("assets/saber.png");
  shipImage = loadImage("assets/xwing.png");
  particleImage = loadImage("assets/bang.png");
  tieFighterImage = loadImage("assets/tiefighter.png");

  ship = createSprite(width/2, height/2);
  ship.maxSpeed = 6;
  ship.friction = 0.98;
  ship.setCollider("circle", 0, 0, 100);

  ship.addImage("normal", shipImage);

  createTieFighter(random(width/2), random(height/2), tieFighterImage);

  asteroids = new Group();
  bullets = new Group();

  for(var i = 0; i < 5; i++) {

    var ang = random(360);
    var asteroidType = floor(random(3));
    var px = width/2 + 1000 * cos(radians(ang));
    var py = height/2+ 1000 * sin(radians(ang));
    createAsteroid(asteroidType, px, py);
  }
}

var THERE = false;
var newX = 5;
var newY = 5;

function draw() {

  console.log(Y);



  if (COUNTER % 150 === 0) {
    newX = random(10, -10);
    newY = random(10, -10);
  }

  tieFighter.position.x += newX;
  tieFighter.position.y += newY;

  COUNTER++;

  background(0);

  image(video, 0,0, 3500, 2000);


  fill(255);

  for(var i=0; i<allSprites.length; i++) {

    var s = allSprites[i];
    if(s.position.x<-MARGIN) s.position.x = width+MARGIN;
    if(s.position.x>width+MARGIN) s.position.x = -MARGIN;
    if(s.position.y<-MARGIN) s.position.y = height+MARGIN;
    if(s.position.y>height+MARGIN) s.position.y = -MARGIN;

  }

  tieFighter.overlap(bullets, tieFighterHit);
  asteroids.overlap(ship, crash);
  tieFighter.overlap(ship, function() {END = true;});

  if(keyDown(LEFT_ARROW)) ship.rotation -= 4;

  //comment out if saber not working
  ship.rotation =  parseInt(1.1 * P);


  if(keyDown(RIGHT_ARROW)) ship.rotation += 4;


  ship.addSpeed(0.2, ship.rotation);

  if((Y >= 550 && SHOT == false) || keyDown(UP_ARROW)) {

    var bullet = createSprite(ship.position.x, ship.position.y);
    bullet.scale = 0.5;
    bullet.addImage(bulletImage);
    bullet.setSpeed(10+ship.getSpeed(), ship.rotation);
    bullet.rotation = ship.rotation-270;
    bullet.life = 75;
    bullets.add(bullet);

    SHOT = true;

    sound(1);
  } else if (SHOT == true && Y < 550) {
    SHOT = false;
  }


  drawSprites();

  if(END) {
    background(0);
    FINAL_SCORE = SCORE;
    //console.log(FINAL_SCORE);
    xwingSound.stop();
    document.getElementById("score").innerHTML = "Your score: " + FINAL_SCORE;
    remove();
  }

  if(COUNTER % 5 === 0) SCORE++;
}

function createAsteroid(type, x, y) {

  var a = createSprite(x, y);
  var img  = loadImage("assets/asteroid.png");
  a.addImage(img);
  a.setSpeed(2.5-(type/2), random(360));
  a.rotationSpeed = 0.5;

  //a.debug = true;
  a.type = type;

  if(type == 2) a.scale = 0.6;

  if(type == 1) a.scale = 0.3;

  a.mass = 2+a.scale;
  a.setCollider("circle", 0, 0, 50);
  asteroids.add(a);

  return a;
}

function createTieFighter(x, y, img) {

  tieFighter = createSprite(random(width), random(height));
  tieFighter.setSpeed = (ship.maxSpeed + 5, random(360));
  tieFighter.setCollider("circle", 0, 0, 50);
  tieFighter.addImage("normal", img);

  if(COUNTER > 5)sound(2);

  return tieFighter;
}

function tieFighterHit(tieFighter, bullet) {

  //console.log("Tie fighter hit");

  for(var i=0; i<10; i++) {
    var p = createSprite(bullet.position.x, bullet.position.y);
    p.addImage(particleImage);
    p.setSpeed(random(3,5), random(360));
    p.friction = 0.95;
    p.life = 15;
  }

  bullet.remove();
  tieFighter.remove();

  SCORE += 100;

  createTieFighter(random(width/2), random(height/2), tieFighterImage);

  var ang = random(360);
  var asteroidType = floor(random(3));
  var px = width/2 + 1000 * cos(radians(ang));
  var py = height/2+ 1000 * sin(radians(ang));
  createAsteroid(asteroidType, px, py);
}

function crash(asteroid, ship) {

  for(var i=0; i<10; i++) {

    var p = createSprite(asteroid.position.x, asteroid.position.y);
    p.addImage(particleImage);
    p.setSpeed(random(3,5), random(360));
    p.friction = 0.95;
    p.life = 15;

  }

  for (var j = 0; j < asteroids.length; j++) {
    asteroids[j].remove();
  }

  ship.remove();
  tieFighter.remove();

  END = true;


}

function sound(x) {

  if (x == 1) {
    if ( xwingSound.isPlaying() ) { // .isPlaying() returns a boolean

    } else {
      xwingSound.play();
    }
  } else if (x == 2) {
    if ( screamSound.isPlaying() ) { // .isPlaying() returns a boolean

    } else {
      screamSound.play();
    }
  }

}

function getScore() {
  return FINAL_SCORE;
}
