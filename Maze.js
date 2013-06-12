//------------------------------------------------------------------------------
// Maze - This is the main graphics component for the program.  The maze is
// a series of pixels in an image data array that is copied to an HTML5
// canvas context continuously.
//
// To alleviate the complexity of this module, other objects/classes provide
// minimal functionality to service this class. A MapData object is always
// passed into this class which describes what the maze looks like from
// a birds-eye-view.  MazeConfig describes traps and destination locations
// within the maze.  The WallHitItem objects help in the ray casting process.
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Constructor -- Gets the maze up and running by building the needed math
// tables in memory, sets up the player's initial position and prepares memory
// image for drawing.
//------------------------------------------------------------------------------
Maze = function(canvasContext, mapData, mazeConfig) {
    'use strict';
	this.canvasContext = canvasContext;
	this.mapData = mapData;
	this.mazeConfig = mazeConfig;

    this.createTables();

    this.curDest = this.mazeConfig.advanceToDest(0);    // zero is the initial starting destination
    //this.playerX = 130;    // initial player position comes from first destination
    //this.playerY = 130;
    //this.playerArc = 0;
    //this.background = new Background(canvasContext);
    this.playerX = this.curDest.xPos;    // initial player position comes from first destination
    this.playerY = this.curDest.yPos;
    this.playerArc = this.curDest.angle;
    this.background = new Background(canvasContext);
    this.background.setBackgroundFromDest(this.curDest);

    // create image as buffer for drawing
	this.memPixels = this.canvasContext.createImageData(MazeGlobals.PROJECTIONPLANEWIDTH, MazeGlobals.PROJECTIONPLANEHEIGHT);

    this.setPlayerPos();
};

Maze.prototype.WALL_HEIGHT = 64;

Maze.prototype.ANGLE60 = MazeGlobals.PROJECTIONPLANEWIDTH;             // field of view for player is 60 degrees and it follows
                                                                // that 5.33 is the ratio of proj plan pixels and angle

Maze.prototype.ANGLE30  = Math.round(Maze.prototype.ANGLE60 / 2);
Maze.prototype.ANGLE90  = Math.round(Maze.prototype.ANGLE30 * 3);
Maze.prototype.ANGLE180 = Math.round(Maze.prototype.ANGLE90 * 2);
Maze.prototype.ANGLE270 = Math.round(Maze.prototype.ANGLE90 * 3);
Maze.prototype.ANGLE360 = Math.round(Maze.prototype.ANGLE60 * 6);
Maze.prototype.ANGLE0   = 0;
Maze.prototype.ANGLE5   = Math.round(Maze.prototype.ANGLE30 / 6);
Maze.prototype.ANGLE10  = Math.round(Maze.prototype.ANGLE5 * 2);

// large precomputed trig and math tables for every possible angle making life easier at runtime
Maze.prototype.sinTable = [];
Maze.prototype.iSinTable = [];   // inverse sin table -- 1/sin(alpha)
Maze.prototype.cosTable = [];
Maze.prototype.iCosTable = [];   // inverse cosine table -- 1/cos(alpha)
Maze.prototype.tanTable = [];
Maze.prototype.iTanTable = [];   // inverse tangent table -- 1/tan(alpha)
Maze.prototype.fishTable = [];   // corrects fish eye view
Maze.prototype.xStepTable = [];  // for each possible angle, here is how far X spans when Y spans by 64
Maze.prototype.yStepTable = [];  // for each possible angle, here is how far Y spans when X spans by 64

// player's coordinates in the maze
Maze.prototype.curDest = null;
Maze.prototype.playerX = 130;
Maze.prototype.playerY = 130;
Maze.prototype.playerArc = 0;   // player's current angle he/she is facing

// players parameters
Maze.prototype.playerDistanceToTheProjectionPlane = 277;
Maze.prototype.playerHeight = 32;
Maze.prototype.playerSpeed = 16;
Maze.prototype.projectionPlaneYCenter = MazeGlobals.PROJECTIONPLANEHEIGHT / 2;

Maze.prototype.playerXDir = 0.0;	 // always equal to cosTable[playerArc];
Maze.prototype.playerYDir = 0.0;     // always eqal to sinTable[playerArc];

Maze.prototype.SLICE_WIDTH = 1;      // width of vertical slice drawn

Maze.prototype.mapData = null;
Maze.prototype.mazeConfig = null;
Maze.prototype.canvasContext = null;  // screen drawing canvas context
Maze.prototype.memPixels = null;   // temp buffer for building image

Maze.prototype.background = null;     // holds background pixels

//------------------------------------------------------------------------------
// Convert from arc angles to radians for trig functions.
//------------------------------------------------------------------------------
Maze.prototype.arcToRad = function(arcAngle) {
    'use strict';
	return(1.0 * (arcAngle * Math.PI) / this.ANGLE180);
};

//------------------------------------------------------------------------------
// Sets up the precalculated trig and math tables in memory which are indexed
// by angle look-ups to make things run smoothly at render time.  Tables are
// set up to handle every possible angle.
//------------------------------------------------------------------------------
Maze.prototype.createTables = function() {
    'use strict';
    var i = 0;
    var radian = 0.0;

    this.sinTable   = new Array(this.ANGLE360 + 1);    // big tables for every possible angle
	this.iSinTable  = new Array(this.ANGLE360 + 1);
	this.cosTable   = new Array(this.ANGLE360 + 1);
	this.iCosTable  = new Array(this.ANGLE360 + 1);
	this.tanTable   = new Array(this.ANGLE360 + 1);
	this.iTanTable  = new Array(this.ANGLE360 + 1);
	this.fishTable  = new Array(this.ANGLE60 + 1);
	this.xStepTable = new Array(this.ANGLE360 + 1);
	this.yStepTable = new Array(this.ANGLE360 + 1);

    for (i = 0; i <= this.ANGLE360; i++) {
	    radian = this.arcToRad(i) + (0.0001);  // convert to radian value for trig calls
	    this.sinTable[i] = Math.sin(radian);
	    this.iSinTable[i] = (1.0 / (this.sinTable[i]));

	    this.cosTable[i] = Math.cos(radian);
	    this.iCosTable[i] = (1.0 / (this.cosTable[i]));

	    this.tanTable[i] = Math.tan(radian);
	   	this.iTanTable[i] = (1.0 / this.tanTable[i]);

	    // west portion of aerial map
	   	if (i >= this.ANGLE90 && i < this.ANGLE270) {
	   		this.xStepTable[i] = (1.0 * MazeGlobals.TILE_SIZE / this.tanTable[i]);
	   		if (this.xStepTable[i] > 0)
	   			this.xStepTable[i] = -this.xStepTable[i];
    	}

	   	// east portion of aerial map
	   	else {
	   		this.xStepTable[i] = (1.0 * MazeGlobals.TILE_SIZE / this.tanTable[i]);
	   		if (this.xStepTable[i] < 0)
	   			this.xStepTable[i] = -this.xStepTable[i];
	   	}

	   	// facing bottom portion of aerial map
	   	if (i >= this.ANGLE0 && i < this.ANGLE180) {
	   		this.yStepTable[i] = (1.0 * MazeGlobals.TILE_SIZE * this.tanTable[i]);
	   		if (this.yStepTable[i] < 0)
	   			this.yStepTable[i] = -this.yStepTable[i];
	   	}

	   	// facing upper portion of aerial map
	   	else {
	   		this.yStepTable[i] = (1.0 * MazeGlobals.TILE_SIZE * this.tanTable[i]);
	   		if (this.yStepTable[i] > 0)
	   			this.yStepTable[i] = -this.yStepTable[i];
	   	}
	}

    // build tables to correct fish eye view
    for (i = -this.ANGLE30; i <= this.ANGLE30; i++) {
    	radian = this.arcToRad(i);
    	this.fishTable[i + this.ANGLE30] = (1.0 / Math.cos(radian));
    }
};

//------------------------------------------------------------------------------
// Sets a pixel in the image data buffer based upon the x and y
// position with the specified rgb values.
//------------------------------------------------------------------------------
Maze.prototype.setPixel = function(x, y, r, g, b) {
    'use strict';
	if (this.memPixels == null) return;
    var index = (x + y * this.memPixels.width) * 4;
    this.memPixels.data[index + 0] = r;
    this.memPixels.data[index + 1] = g;
    this.memPixels.data[index + 2] = b;
    this.memPixels.data[index + 3] = 0xff;  // 0xff is opaque
};

//------------------------------------------------------------------------------
// Casts one ray of specified angle looking at all possible intersections with
// grid lines (in the aerial view sense) to find and return the closest horizontal
// wall hit.
//------------------------------------------------------------------------------
Maze.prototype.castRayForHorizHit = function(castArc) {
    'use strict';
	var distToNextXIntersection;
	var distToNextHorizontalGrid;

	var ay = 0;
	var ax = 0.0;
	var hitSide = WallHitItem.prototype.BOTTOM_SIDE_HIT;

	// STEP ONE -- (the hardest one) find the coord of where the first horiz wall is hit

	// ray is facing down
	if (castArc > this.ANGLE0 && castArc < this.ANGLE180) {
		// the following line is simply  ay = (py/64) * (64) + 64   where "p" is the
		// players position and "a" is the position of the first horiz line hit
		// this is simply looking at the next horizontal line past the player
		ay = ((this.playerY >> MazeGlobals.TILE_SIZE_SHIFT) << MazeGlobals.TILE_SIZE_SHIFT) + MazeGlobals.TILE_SIZE;

		// if we know one side and one angle, we can get the other side
		// ax = px + (ay - py) / tan(alpha)
		ax = this.playerX + ((ay - this.playerY) * this.iTanTable[castArc]);

	    // ray is going down so increment by positive 64 going
	    // from one line to the next in step 3
	    distToNextHorizontalGrid = MazeGlobals.TILE_SIZE;
	}

	// else, the ray is facing up
	else {
	    // if we do hit, it will be the top of the cube
	    hitSide = WallHitItem.prototype.TOP_SIDE_HIT;

		// ay = (py/64) * (64)
		// this is simply looking at the previous horizontal line just prior to the player
		ay = (this.playerY >> MazeGlobals.TILE_SIZE_SHIFT) << MazeGlobals.TILE_SIZE_SHIFT;

		// if we know one side and one angle, we can get the other side
		// ax = px + (ay - py) / tan(alpha)
		ax = this.playerX + ((ay - this.playerY) * this.iTanTable[castArc]);

		// ray is going up so decrement by 64 (going up means less y)
		// as we move from one horiz line to the next in step 3
		distToNextHorizontalGrid = -MazeGlobals.TILE_SIZE;

		// convention used to determine if the line is part of the block above or below the line
		ay--;
	}
	var horizItemHit = new WallHitItem(WallHitItem.prototype.HORIZ_HIT, ay, ax, castArc);


	// if horizontal ray
	if (castArc == this.ANGLE0 || castArc == this.ANGLE180) {
		// if casting parallel to horiz wall ignore all horiz hits
		horizItemHit.distToItem = Number.MAX_VALUE;
	}

	// else, move the ray until it hits a horizontal wall
	else {

		// STEP TWO -- set distToNextXIntersection and distToNextHorizontalGrid (already done)

		// set precalculated distance between x lines for this angle
		distToNextXIntersection = this.xStepTable[castArc];
		while (true) {

			// STEP THREE -- convert to the small grid coordinates and see if we are on a wall

			horizItemHit.calcAndSetMapPos(this.mapData);
			horizItemHit.calcAndSetOffTheMap(this.mapData);
			if (horizItemHit.offTheMap) {
				break;
			}

			// if wall was hit, stop here
			else if (this.mapData.isWall(horizItemHit.mapPos)) {
				// if we know one side and one angle, we can get the hypotenuse
				horizItemHit.distToItem = ((horizItemHit.intersection - this.playerX) * this.iCosTable[castArc]);
				break;
			}

			// STEP FOUR -- continue to next horiz line intersection by incrementing
			// by the exact same offsets each time

			else { // else, the ray is not blocked, extend to the next block
				horizItemHit.intersection = (horizItemHit.intersection + distToNextXIntersection);
				horizItemHit.gridLine = (horizItemHit.gridLine + distToNextHorizontalGrid);
			}
		}
	}
	return horizItemHit;
};

//------------------------------------------------------------------------------
// Casts one ray of specified angle looking at all possible intersections with
// grid lines (in the aerial view sense) to find and return the closest vertical
// wall hit.
//
// Comments are omitted in this method for the sake of brevity, but would closely
// parallel comments in the castRayForHorzHit method above.
//------------------------------------------------------------------------------
Maze.prototype.castRayForVertHit = function(castArc) {
    'use strict';
	var distToNextYIntersection;
	var distToNextVerticalGrid;

	var ax = 0;
	var ay = 0.0;
	var hitSide = WallHitItem.prototype.RIGHT_SIDE_HIT;

	if (castArc < this.ANGLE90 || castArc > this.ANGLE270) {
		ax = ((this.playerX >> MazeGlobals.TILE_SIZE_SHIFT) << MazeGlobals.TILE_SIZE_SHIFT) + MazeGlobals.TILE_SIZE;
		ay = this.playerY + ((ax - this.playerX) * this.tanTable[castArc]);
		distToNextVerticalGrid = MazeGlobals.TILE_SIZE;
	}
	else {
	    hitSide = WallHitItem.prototype.LEFT_SIDE_HIT;
		ax = (this.playerX >> MazeGlobals.TILE_SIZE_SHIFT) << MazeGlobals.TILE_SIZE_SHIFT;
		ay = this.playerY + ((ax - this.playerX) * this.tanTable[castArc]);
		distToNextVerticalGrid = -MazeGlobals.TILE_SIZE;
		ax--;
	}
	var vertItemHit = new WallHitItem(WallHitItem.prototype.VERT_HIT, ax, ay, castArc);

	if (castArc == this.ANGLE90 || castArc == this.ANGLE270) {
		vertItemHit.distToItem = Number.MAX_VALUE;
	}
	else {
		distToNextYIntersection = this.yStepTable[castArc];
		while (true) {
			vertItemHit.calcAndSetMapPos(this.mapData);
			vertItemHit.calcAndSetOffTheMap(this.mapData);

			if (vertItemHit.offTheMap)  {
				break;
			}

			else if (this.mapData.isWall(vertItemHit.mapPos)) {
				vertItemHit.distToItem = ((vertItemHit.intersection - this.playerY) * this.iSinTable[castArc]);
				break;
			}

			else {
				vertItemHit.intersection = (vertItemHit.intersection + distToNextYIntersection);
				vertItemHit.gridLine = (vertItemHit.gridLine + distToNextVerticalGrid);
			}
		}
	}

	return vertItemHit;
};

//------------------------------------------------------------------------------
// Draws one complete frame starting with the background then each vertical
// line on the projection plane is casted and drawn from left to right covering
// 60 degrees of the players field of vision.
//------------------------------------------------------------------------------
Maze.prototype.renderOneFrame = function() {
    'use strict';
   this.background.copyBackgroundTo(this.memPixels);

   // field of view is 60 degree with player's direction (angle) in the middle
   // we will trace the rays starting from the leftmost ray
   var castArc = this.playerArc - this.ANGLE30;
   if (castArc < 0)    // wrap around if necessary
	   castArc = this.ANGLE360 + castArc;

   // go from left most column to right most column
   for (var castColumn = 0; castColumn < MazeGlobals.PROJECTIONPLANEWIDTH; castColumn += this.SLICE_WIDTH) {
	   // try out same angle with both vert and horiz wall
	   var horizWallHitItem = this.castRayForHorizHit(castArc);
	   var vertWallHitItem = this.castRayForVertHit(castArc);

	   // draw the closest of the two wall hits either vert or horiz
	   if (!(vertWallHitItem.offTheMap && horizWallHitItem.offTheMap)) {
		   var closestHit = determineClosestHit(horizWallHitItem, vertWallHitItem);
		   if (closestHit.distToItem <= -0.0)   // -0.0 happens sometimes and must be changed
			   closestHit.distToItem = 1.0;
		   this.drawWallSlice(castColumn, closestHit);
	   }

	   // increment angle moving on to the next slice (remember ANGLE60 == PROJECTIONPLANEWIDTH)
	   castArc += this.SLICE_WIDTH;
	   if (castArc >= this.ANGLE360)
			castArc -= this.ANGLE360;

	   // we are done with these so enable garbase collection
	   horizWallHitItem = null;
	   vertWallHitItem = null;
   }

   this.paint();
};

//------------------------------------------------------------------------------
// Draws one wall slice scaling it based upon distance and accounts for fish
// eye lense correction.
//------------------------------------------------------------------------------
Maze.prototype.drawWallSlice = function(castColumn, itemHit) {
    'use strict';
 	var sliceOfWall;    // where slice hits wall
	var dist;
	var topOfWall;      // used to compute the top and bottom of the sliver that
	var bottomOfWall;   // ...will be the starting point of floor and ceiling

	if (!itemHit.offTheMap) {
		sliceOfWall = (~~(itemHit.intersection)) % MazeGlobals.TILE_SIZE;
		dist = itemHit.distToItem;
		dist /= this.fishTable[castColumn];

		var projectedWallHeight = this.WALL_HEIGHT * (this.playerDistanceToTheProjectionPlane / dist);
		bottomOfWall = this.projectionPlaneYCenter + ~~(projectedWallHeight * 0.5);
		topOfWall = MazeGlobals.PROJECTIONPLANEHEIGHT - bottomOfWall;
		if (bottomOfWall >= MazeGlobals.PROJECTIONPLANEHEIGHT) bottomOfWall = MazeGlobals.PROJECTIONPLANEHEIGHT - 1;

        var sliceWidth = this.SLICE_WIDTH;
        var leftMostOfSlice = 0;
        if (itemHit.hitSide == itemHit.TOP_SIDE_HIT || itemHit.getSide == itemHit.RIGHT_SIDE_HIT) {
            leftMostOfSlice = ((sliceOfWall - sliceWidth) > 0) ? (sliceOfWall - sliceWidth) : 0;
        }
        else {  // with bottom and right wall hits you must invert the image
            leftMostOfSlice = ((sliceOfWall + sliceWidth) <= MazeGlobals.TILE_SIZE) ? (sliceOfWall + sliceWidth) : MazeGlobals.TILE_SIZE;
            leftMostOfSlice = MazeGlobals.TILE_SIZE - leftMostOfSlice;
        }

        // grab the appropriate image from hashtable
        var ch = this.mapData.mapData[itemHit.mapPos]
        if (ch == '0') return;
        var imageCanvas = this.mapData.getCanvasImage(ch);
        if (imageCanvas == null) return;

		this.drawVertSliceOfImage(castColumn, topOfWall, projectedWallHeight, imageCanvas.imageData, MazeGlobals.TILE_SIZE, leftMostOfSlice);
	}
};

//------------------------------------------------------------------------------
// Draws a vertical slice of image on the specified column scaling appropriately.
//------------------------------------------------------------------------------
Maze.prototype.drawVertSliceOfImage = function(col, topOfLine, lineHeight, imageData, srcImageHeight, srcColImage) {
    'use strict';
    var ratio = srcImageHeight / lineHeight;  // ratio between source and dest
    var yImage = 0;
    var botOfLine = topOfLine + lineHeight;
    var srcImageWidthTimesHeight = srcImageHeight * srcImageHeight;   // assumes height and width are equal
    for (var y = topOfLine; y < botOfLine; y++) {
        yImage++;
        var pixelPos = (y * MazeGlobals.PROJECTIONPLANEWIDTH) + col;
        if (pixelPos >= 0 && pixelPos < (MazeGlobals.PROJECTIONPLANE_WIDTHTIMESHEIGHT)) {
            var srcPixelPos = (~~((ratio) * yImage) * srcImageHeight) + srcColImage;
            if (srcPixelPos >= 0 && srcPixelPos < srcImageWidthTimesHeight) {
                var srcIndex = srcPixelPos * 4;
                if (imageData.data[srcIndex + 3] != 0) {     // check to make sure pixel is not transparent
                    this.setPixel(col, y, imageData.data[srcIndex], imageData.data[srcIndex + 1], imageData.data[srcIndex + 2]);
                }
            }
        }
    }
};

//------------------------------------------------------------------------------
// Renders the image by pushing the image data pixels to the graphics context.
//------------------------------------------------------------------------------
Maze.prototype.paint = function() {
    'use strict';
	this.canvasContext.putImageData(this.memPixels, 0, 0);
};

//------------------------------------------------------------------------------
// Rotates the player's angle left.
//------------------------------------------------------------------------------
Maze.prototype.rotateLeft = function() {
    'use strict';
	if ((this.playerArc -= this.ANGLE10) < this.ANGLE0)
		this.playerArc += this.ANGLE360;
	this.setPlayerPos();
};

//------------------------------------------------------------------------------
// Rotate's player's angle right.
//------------------------------------------------------------------------------
Maze.prototype.rotateRight = function() {
    'use strict';
	if ((this.playerArc += this.ANGLE10) >= this.ANGLE360)
		this.playerArc -= this.ANGLE360;
	this.setPlayerPos();
};

//------------------------------------------------------------------------------
// Sets the players x and y directions based upon the current angle.
//------------------------------------------------------------------------------
Maze.prototype.setPlayerPos = function() {
    'use strict';
    this.playerXDir = this.cosTable[this.playerArc];
    this.playerYDir = this.sinTable[this.playerArc];
};

//------------------------------------------------------------------------------
// Moves the player forward.
//------------------------------------------------------------------------------
Maze.prototype.moveForward = function() {
    'use strict';
	var newPlayerX = this.playerX + this.playerXDir * this.playerSpeed;
	var newPlayerY = this.playerY + this.playerYDir * this.playerSpeed;
	this.attemptMove(newPlayerX, newPlayerY);
};

//------------------------------------------------------------------------------
// Moves the player backward.
//------------------------------------------------------------------------------
Maze.prototype.moveBackward = function() {
    'use strict';
	var newPlayerX = this.playerX - this.playerXDir * this.playerSpeed;
    var newPlayerY = this.playerY - this.playerYDir * this.playerSpeed;
	this.attemptMove(newPlayerX, newPlayerY);
};

//------------------------------------------------------------------------------
// Attempts a move to a new position checking to make sure we are not moving
// inside a wall.
//------------------------------------------------------------------------------
Maze.prototype.attemptMove = function(newPlayerX, newPlayerY) {
    'use strict';
    // attempt moving to new x/y position
    var xGridIndex = newPlayerX >> MazeGlobals.TILE_SIZE_SHIFT;  // this is essentially rounding down to a close grid line
    var yGridIndex = newPlayerY >> MazeGlobals.TILE_SIZE_SHIFT;
    var mapIndex = this.mapData.convertPointToMapPos(xGridIndex, yGridIndex);
    if (mapIndex < (this.mapData.mapHeight << this.mapData.mapWidthShift) && !this.mapData.isWall(mapIndex)) {
        this.playerX = newPlayerX;
        this.playerY = newPlayerY;
        return;
    }

    // can't move new x/y so just try x
    xGridIndex = newPlayerX >> MazeGlobals.TILE_SIZE_SHIFT;
    yGridIndex = this.playerY >> MazeGlobals.TILE_SIZE_SHIFT;    // keep old y
    mapIndex = this.mapData.convertPointToMapPos(xGridIndex, yGridIndex);
    if (mapIndex < (this.mapData.mapHeight << this.mapData.mapWidthShift) && !this.mapData.isWall(mapIndex)) {
        this.playerX = newPlayerX;
        return;
    }

    // just try y
    xGridIndex = this.playerX >> MazeGlobals.TILE_SIZE_SHIFT;    // keep old x
    yGridIndex = newPlayerY >> MazeGlobals.TILE_SIZE_SHIFT;
    mapIndex = this.mapData.convertPointToMapPos(xGridIndex, yGridIndex);
    if (mapIndex < (this.mapData.getMapHeight << this.mapData.mapWidthShift) && !this.mapData.isWall(mapIndex)) {
        this.playerY = newPlayerY;
        return;
    }
};
