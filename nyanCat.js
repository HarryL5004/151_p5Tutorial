// Author: Harry Leung
// For reference: nyan cat size - W:264 H:168 Gap:56
let screenSize = {w:1536, h:722};
let docWidth, docHeight;
let canvas, nyanCanvas, bgCanvas;

let nyanMusic, nyanImg, rainbowImg, earth; // for preloading
let globeNyanCats, smallNyanCats, vNyanCats, hNyanCats; // arrays for nyan cats
let hDir, vDir; // keep track of vertical and horizontal nyan cats direction

function getRand(min, max) {
    if (min === max) return min;
    return Math.floor(Math.random() * (max - min + 1) + min);
}

class Trail {
    constructor(limit = 10, rWidth, rHeight) {
        this.history = [];
        this.speed = rWidth;
        this.limit = limit;
        this.rainbowDim = {w: rWidth, h: rHeight};
    }

    add(vect) {
        this.history.push(vect);
    }

    showNUpdate() {
        this.history.forEach(coords => {
            nyanCanvas.image(rainbowImg, coords.x, coords.y, this.rainbowDim.w, this.rainbowDim.h);
            coords.x-=this.speed;
        });
        this.remove();
    }

    remove() {
        if (this.history.length > this.limit) {
            this.history.shift();
        }
    }
}

class NyanCat {
    constructor(x, y, width=43, height=15, trailCnt=20, trailWidth=10, trailHeight=5, dx=0.2, dy=0.1, amp=40) {
        this.coords = {x:0, y:0};
        this.pos = {x, y};
        this.dimension = {w: width, h: height};
        this.trail = new Trail(trailCnt, trailWidth, trailHeight);
        this.amplitude = amp;
        this.dx = dx;
        this.dy = dy;
        this.radians = [0, 0];
    }
    
    calcSinVal(d, index) {
        this.radians[index] += d;
        return Math.sin(this.radians[index]) * this.amplitude;
    }

    move() {
        this.trailing();
        this.coords.x = this.calcSinVal(this.dx, 0) + this.pos.x;
        this.coords.y = this.calcSinVal(this.dy, 1) + this.pos.y;
        
    }

    trailing() {
        // calculate x, y for the trail
        let trailXPos = this.coords.x;
        let trailYPos = this.coords.y+(this.dimension.h/2)-(this.trail.rainbowDim.h/2);
        this.trail.add(createVector(trailXPos, trailYPos)); // add coords for new trail
        this.trail.showNUpdate();
    }

    show() {
        nyanCanvas.image(nyanImg, this.coords.x, this.coords.y, this.dimension.w, this.dimension.h);
    }
}

class SmallNyanCat {
    constructor(x, y, xDir, yDir, xSpd=4, ySpd=5, multipler=1) {
        this.coords = {x,y};
        this.dimension = {w: 33*multipler, h: 21*multipler, g: 7*multipler};
        this.speed = createVector(xSpd,ySpd);
        this.direction = createVector(xDir,yDir);
        this.colors = [color(231, 8, 15), color(231, 145, 15),
                      color(231, 237, 15), color(47, 237, 15), 
                      color(2, 145, 244), color(93, 54, 244)];
        this.currColor = 0;
        this.radius = 10;
        this.multipler=multipler;
    }

    move() {
        this.trailing();
        this.coords.x += this.speed.x*this.direction.x;
        this.coords.y += this.speed.y*this.direction.y;
    }

    trailing() {
        // determine trail position
        let trailXPos;
        let trailYPos;
        if (this.direction.x === 0) { // vertical
            trailXPos = this.coords.x+this.dimension.w/2;
            trailYPos = this.direction.y === 1 ? this.coords.y : this.coords.y + this.dimension.h - this.dimension.g;
        } else if (this.direction.y === 0) { // horizontal
            trailXPos = this.direction.x === 1 ? this.coords.x + this.dimension.g : this.coords.x + this.dimension.w - this.dimension.g;
            trailYPos = this.coords.y+this.dimension.h/2;
        } else {
            trailXPos = this.coords.x+this.dimension.w/2;
            trailYPos = this.coords.y+this.dimension.h/2;
        }
        // determine trail color
        let color = this.currColor % 1 === 0 ? this.colors[this.currColor] : 
                    lerpColor(this.colors[this.currColor-0.5], this.colors[this.currColor+0.5], 0.5);
        this.currColor = this.currColor+0.5 > 5 ? 0 : this.currColor+0.5;

        bgCanvas.fill(color);
        bgCanvas.noStroke();
        bgCanvas.circle(trailXPos, trailYPos, this.radius);
    }

    show() {
        let xPrime = this.coords.x-docWidth/2;
        let yPrime = this.coords.y-docHeight/2;

        push();
        if (this.direction.x === 1)
            image(nyanImg, xPrime, yPrime, this.dimension.w, this.dimension.h);
        else if (this.direction.x === -1) {
            scale(-1,1); // flip image
            image(nyanImg, -(xPrime)-this.dimension.w, yPrime, this.dimension.w, this.dimension.h);
        }
        else if (this.direction.y === 1) {
            // rotate 90 degrees clockwise
            translate(width/2, height/2);
            rotate(HALF_PI);            
            imageMode(CENTER);
            image(nyanImg, -(docHeight/2-(yPrime+this.dimension.h))-this.dimension.h/2, 
                            docWidth/2-(xPrime+this.dimension.w)+this.dimension.w/2, 
                            this.dimension.w, this.dimension.h);
        }
        else {
            // rotate 90 degrees counter-clockwise
            translate(width/2, height/2);
            rotate(-HALF_PI);            
            imageMode(CENTER);
            image(nyanImg, (docHeight/2-(yPrime+this.dimension.h))+this.dimension.h/2, 
                            -(docWidth/2-(xPrime+this.dimension.w))-this.dimension.w/2, 
                            this.dimension.w, this.dimension.h);
        }
        pop();
    }
}

function preload() {
    // load images
    nyanImg = loadImage("assets/nyanCat.gif");
    rainbowImg = loadImage("assets/rainbow.png");

    // music
    soundFormats('ogg', 'mp3');
    nyanMusic = loadSound('assets/nyanCatshort');
    nyanMusic.onended(() => {
        if (!nyanMusic.isPaused())
            nyanMusic.play(undefined, undefined, undefined, 3.95);
    });
    nyanMusic.setVolume(0.4);

    // load model and img for Earth
    earth = {model: loadModel("assets/Earth2K.obj", true),
             img: loadImage("assets/Diffuse_2K.png")};

    // initialize globals
    docWidth = windowWidth;
    docHeight = windowHeight;
    vDir = 1;
    hDir = 1;
    globeNyanCats = [];
    smallNyanCats = [];
    hNyanCats = [];
    vNyanCats = [];
}

function setup() {
    document.body.style.overflow = "hidden"; // get rid of scrollbar
    document.getElementsByTagName("main")[0].addEventListener('contextmenu', e => {
        e.preventDefault();
    });
    canvas = createCanvas(docWidth, docHeight, WEBGL); // WEBGL canvas
    nyanCanvas = createGraphics(docWidth, docHeight); // 2D canvas for model
    bgCanvas = createGraphics(docWidth, docHeight); // canvas for trail
    frameRate(60);

    // initialize nyan cats
    let nyanCatWidth = 43*min(docWidth/screenSize.w, docHeight/screenSize.h); // scale
    let nyanCatHeight = 15**min(docWidth/screenSize.w, docHeight/screenSize.h); // scale
    globeNyanCats.push(new NyanCat(docWidth/2, docHeight/2, nyanCatWidth, nyanCatHeight, 60),
                       new NyanCat(docWidth/4, docHeight/2, nyanCatWidth, nyanCatHeight, 30, 
                                   undefined, undefined, 0.4, 0.2, 60),
                       new NyanCat(docWidth/1.2, docHeight/2, nyanCatWidth, nyanCatHeight, 30, 
                                   undefined, undefined, 0.1, 0.4, 80));
    vNyanCats.push(new SmallNyanCat(getRand(1, docWidth), 0, 0, 1, 0),
                   new SmallNyanCat(getRand(1, docWidth), docHeight, 0, -1,0));
    hNyanCats.push(new SmallNyanCat(0, getRand(1, docHeight), 1, 0, undefined, 0),
                   new SmallNyanCat(docWidth, getRand(1, docHeight), -1, 0, undefined, 0));
}

function draw() {
    background(8, 20, 39); // redraw canvas
    
    // custom configurations for the globe
    push();
    lights();
    rotate(frameCount*0.015, [0,1,0]);
    scale(2.0*min(docWidth/screenSize.w, docHeight/screenSize.h));
    texture(nyanCanvas);
    noStroke();
    model(earth.model);
    pop();

    // redraw canvas on model
    nyanCanvas.background(earth.img);    
    // draw bgCanvas starting at the top left corner
    image(bgCanvas, -docWidth/2, -docHeight/2, docWidth, docHeight);

    // display and update nyan cats locations
    globeNyanCats.forEach(cat => {
        cat.move();
        cat.show();
    })

    smallNyanCats.forEach((cat, i) => {
        cat.move();
        cat.show();
        // remove out of bounds nyan cats
        if (cat.coords.x > docWidth || cat.coords.x < 0 ||
            cat.coords.y > docHeight || cat.coords.y < 0) {
                smallNyanCats.splice(i, 1);
        }
    })

    vNyanCats.forEach((cat, i) => {
        cat.move();
        cat.show();
        // remove out of bounds nyan cats
        if (cat.coords.x > docWidth+cat.dimension.w || cat.coords.x < -cat.dimension.w ||
            cat.coords.y > docHeight+cat.dimension.h || cat.coords.y < -cat.dimension.h) {
                vNyanCats.splice(i, 1);
        }
    });

    hNyanCats.forEach((cat, i) => {
        cat.move();
        cat.show();
        // remove out of bounds nyan cats
        if (cat.coords.x > docWidth+cat.dimension.w || cat.coords.x < -cat.dimension.w ||
            cat.coords.y > docHeight+cat.dimension.h || cat.coords.y < -cat.dimension.h) {
                hNyanCats.splice(i, 1);
        }
    });

    // add nyan cats to canvas
    if (vNyanCats.length < 2) {
        vDir *= -1;
        let y = vDir === 1 ? 0 : docHeight;
        let multipler = getRand(1,5);
        vNyanCats.push(new SmallNyanCat(getRand(10, docWidth-10), y, 0, vDir, 0, Math.floor(Math.random()*10+1)/multipler, multipler));
    }

    if (hNyanCats.length < 2) {
        hDir *= -1;
        let x = hDir === 1 ? 0 : docWidth;
        let multipler = getRand(1,5);
        hNyanCats.push(new SmallNyanCat(x, getRand(10, docHeight-10), hDir, 0,  Math.floor(Math.random()*10+1)/multipler, 0, multipler));
    }
}

function mousePressed() {
    smallNyanCats.push(new SmallNyanCat(mouseX, mouseY, 1, 1),
                       new SmallNyanCat(mouseX, mouseY, -1, 1),
                       new SmallNyanCat(mouseX, mouseY, 1, -1),
                       new SmallNyanCat(mouseX, mouseY, -1, -1));
}

// event listeners
function keyPressed() {
    if (key === 'p' && isLooping()) {
        noLoop();
    }        
    else if (key === 'p') {
        loop();
    }

    if (key === ' ' && nyanMusic.isPlaying())
        nyanMusic.pause();
    else if (key === ' ') {
        nyanMusic.play();
    }

    if (key === 'r') {
        bgCanvas.clear();
    }

    if (key === 'd') {
        saveCanvas(canvas, "p5NyanCat", "png");
    }
    return false;
}

function mouseWheel(e) {
    vNyanCats.forEach(cat => {
        cat.speed.y = cat.speed.y - e.delta/100 > 0 ? cat.speed.y - e.delta/100 : 1;
    });

    hNyanCats.forEach(cat => {
        cat.speed.x = cat.speed.x - e.delta/100 > 0 ? cat.speed.x - e.delta/100 : 1;
    });

    smallNyanCats.forEach(cat => {
        cat.speed.x = cat.speed.x - e.delta/100 > 0 ? cat.speed.x - e.delta/100 : 1;
        cat.speed.y = cat.speed.y - e.delta/100 > 0 ? cat.speed.y - e.delta/100 : 1;
    });
}