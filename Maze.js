//------------------------------------------------------------------------------
// Maze - This is the main graphics component for the program.  The maze is
// a series of pixels in an image data array that is copied to an HTML5
// canvas context continuously.
//
// To alleviate the complexity of this module, other objects/classes provide
// minimal functionality to service this class. A MapData object is always
// passed in and describes what the maze looks like from
// a birds-eye-view.  MazeConfig describes traps and destination locations
// within the maze.  The WallHitItem objects help in the ray casting process.
//
// @author brianpratt
//------------------------------------------------------------------------------

// Namespace: Maze
if (Maze == null || typeof(Maze) != "object") {var Maze = new Object();}

//------------------------------------------------------------------------------
// Constructor -- Gets the maze up and running by building the needed math
// tables in memory, sets up the player's initial position and prepares memory
// image for drawing.
//------------------------------------------------------------------------------
Maze = function(canvasContext, mapData, propData, mazeConfig, questions, questionPosData) {
    'use strict';
	this.canvasContext = canvasContext;
	this.mapData = mapData;
	this.propData = propData;
	this.mazeConfig = mazeConfig;
    this.questions = questions;
    this.questionPosData = questionPosData;

    //this.createTables();
    this.trig = new Trig();

    this.curDest = this.mazeConfig.advanceToDest(0);    // zero is the initial starting destination
    this.playerX = this.curDest.xPos;    // initial player position comes from first destination
    this.playerY = this.curDest.yPos;
    this.playerArc = this.curDest.angle;
    this.background = new Background(canvasContext);
    this.background.setBackgroundFromDest(this.mazeConfig.document, this.mazeConfig.mazeId, this.curDest);
    this.landscape = new Landscape(canvasContext);
    this.landscape.setLandscapeFromDest(this.mazeConfig.document, this.mazeConfig.mazeId, this.curDest);

    this.overlay = new Overlay(canvasContext);

    // create image as buffer for drawing
	this.memPixels = this.canvasContext.createImageData(MazeGlobals.PROJECTIONPLANEWIDTH, MazeGlobals.PROJECTIONPLANEHEIGHT);

    this.setPlayerPos();
};

Maze.prototype.WALL_HEIGHT = 64;

Maze.prototype.trig = null;

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

Maze.prototype.propHitItems = [];
Maze.prototype.clipper = [];          // clipping array tracking wall distances for clipping props around corners

Maze.prototype.playerXDir = 0.0;	 // always equal to cosTable[playerArc];
Maze.prototype.playerYDir = 0.0;     // always eqal to sinTable[playerArc];

Maze.prototype.curTrap = null;       // current Trap object - we hold on to this just for the message info

Maze.prototype.SLICE_WIDTH = 1;      // width of vertical slice drawn

Maze.prototype.mapData = null;
Maze.prototype.propData = null;
Maze.prototype.questions = null;
Maze.prototype.questionPosData = null;
Maze.prototype.mazeConfig = null;
Maze.prototype.canvasContext = null;  // screen drawing canvas context
Maze.prototype.memPixels = null;      // temp buffer for building image

Maze.prototype.background = null;   // holds background pixels
Maze.prototype.overlay = null;      // holds overlay pixels
Maze.prototype.landscape = null;    // holds landscape pixels
Maze.prototype.curQuestion = '0';   // current question we are on... '0' means no question at all

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
// (See associated document which describes steps one through four in great detail.)
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
	if (castArc > this.trig.ANGLE0 && castArc < this.trig.ANGLE180) {
		// the following line is simply  ay = (py/64) * (64) + 64   where "p" is the
		// players position and "a" is the position of the first horiz line hit
		// this is simply looking at the next horizontal line past the player
		ay = ((this.playerY >> MazeGlobals.TILE_SIZE_SHIFT) << MazeGlobals.TILE_SIZE_SHIFT) + MazeGlobals.TILE_SIZE;

		// if we know one side and one angle, we can get the other side
		// ax = px + (ay - py) / tan(alpha)
		ax = this.playerX + ((ay - this.playerY) * this.trig.iTanTable[castArc]);

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
		ax = this.playerX + ((ay - this.playerY) * this.trig.iTanTable[castArc]);

		// ray is going up so decrement by 64 (going up means less y)
		// as we move from one horiz line to the next in step 3
		distToNextHorizontalGrid = -MazeGlobals.TILE_SIZE;

		// convention used to determine if the line is part of the block above or below the line
		ay--;
	}
	var horizItemHit = new WallHitItem(WallHitItem.prototype.HORIZ_HIT, ay, ax, castArc);


	// if horizontal ray
	if (castArc == this.trig.ANGLE0 || castArc == this.trig.ANGLE180) {
		// if casting parallel to horiz wall ignore all horiz hits
		horizItemHit.distToItem = Number.MAX_VALUE;
	}

	// else, move the ray until it hits a horizontal wall
	else {

		// STEP TWO -- set distToNextXIntersection and distToNextHorizontalGrid (already done)

		// set precalculated distance between x lines for this angle
		distToNextXIntersection = this.trig.xStepTable[castArc];
		while (true) {

			// STEP THREE -- convert to the small grid coordinates and see if we are on a wall

            var questItemTypeHit = '0';    // type of question item hit, '0' denotes no hit
			var mapPos = horizItemHit.calcAndSetMapPos(this.mapData);
			horizItemHit.calcAndSetOffTheMap(this.mapData);
			if (horizItemHit.offTheMap) {
				break;
			}

            // if prop item was hit and not currently found in list of prop hits, add to prop list and keep going
            else if (this.propData.isProp(mapPos)
                    && (typeof this.propHitItems.findFirst(function(o) {return o.mapPos == mapPos;})) == "undefined") {
                var propHitItem = new PropHitItem(mapPos, this.trig);
                propHitItem.setPropHitItemData(this.mapData, this.playerX, this.playerY, this.playerArc);
                this.propHitItems.push(propHitItem);
            }

            // if question item was hit, determine which item was hit, and treat it similarly
            // to prop item hit by adding it to the prop list and keep going
            else if (((questItemTypeHit = this.questionPosData.getQuestionItemTypeAtSpecial(mapPos, this.questions, this.curQuestion)) != '0')
                    && (typeof this.propHitItems.findFirst(function(o) {return o.mapPos == mapPos;})) == "undefined") {
                var questionPropHit = new QuestionHitItem(mapPos, this.trig, questItemTypeHit);
                questionPropHit.setPropHitItemData(this.mapData, this.playerX, this.playerY, this.playerArc);
                this.propHitItems.push(questionPropHit);
            }

            // if wall was hit, stop here
			else if (!this.propData.isProp(mapPos) && this.mapData.isWall(horizItemHit.mapPos)) {
				// if we know one side and one angle, we can get the hypotenuse
				horizItemHit.distToItem = ((horizItemHit.intersection - this.playerX) * this.trig.iCosTable[castArc]);
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

	if (castArc < this.trig.ANGLE90 || castArc > this.trig.ANGLE270) {
		ax = ((this.playerX >> MazeGlobals.TILE_SIZE_SHIFT) << MazeGlobals.TILE_SIZE_SHIFT) + MazeGlobals.TILE_SIZE;
		ay = this.playerY + ((ax - this.playerX) * this.trig.tanTable[castArc]);
		distToNextVerticalGrid = MazeGlobals.TILE_SIZE;
	}
	else {
	    hitSide = WallHitItem.prototype.LEFT_SIDE_HIT;
		ax = (this.playerX >> MazeGlobals.TILE_SIZE_SHIFT) << MazeGlobals.TILE_SIZE_SHIFT;
		ay = this.playerY + ((ax - this.playerX) * this.trig.tanTable[castArc]);
		distToNextVerticalGrid = -MazeGlobals.TILE_SIZE;
		ax--;
	}
	var vertItemHit = new WallHitItem(WallHitItem.prototype.VERT_HIT, ax, ay, castArc);

	if (castArc == this.trig.ANGLE90 || castArc == this.trig.ANGLE270) {
		vertItemHit.distToItem = Number.MAX_VALUE;
	}
	else {
		distToNextYIntersection = this.trig.yStepTable[castArc];
		while (true) {
            var questItemTypeHit = '0';    // type of question item hit, '0' denotes no hit
			var mapPos = vertItemHit.calcAndSetMapPos(this.mapData);
			vertItemHit.calcAndSetOffTheMap(this.mapData);

			if (vertItemHit.offTheMap)  {
				break;
			}

            else if (this.propData.isProp(mapPos)
                    && (typeof this.propHitItems.findFirst(function(o) {return o.mapPos == mapPos;})) == "undefined") {
                var propHitItem = new PropHitItem(mapPos, this.trig);
                propHitItem.setPropHitItemData(this.mapData, this.playerX, this.playerY, this.playerArc);
                this.propHitItems.push(propHitItem);
            }

            else if (((questItemTypeHit = this.questionPosData.getQuestionItemTypeAtSpecial(mapPos, this.questions, this.curQuestion)) != '0')
                    && (typeof this.propHitItems.findFirst(function(o) {return o.mapPos == mapPos;})) == "undefined") {
                var questionPropHit = new QuestionHitItem(mapPos, this.trig, questItemTypeHit);
                questionPropHit.setPropHitItemData(this.mapData, this.playerX, this.playerY, this.playerArc);
                this.propHitItems.push(questionPropHit);
            }

            else if (!this.propData.isProp(mapPos) && this.mapData.isWall(vertItemHit.mapPos)) {
				vertItemHit.distToItem = ((vertItemHit.intersection - this.playerY) * this.trig.iSinTable[castArc]);
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
// Draws the specified prop based upon hit item details.
//------------------------------------------------------------------------------
Maze.prototype.castProp = function(propHit) {
    'use strict';
    var dist = propHit.dist;
    var colMidProp = propHit.colMidProp;
    if (dist == -1 || colMidProp == -1) return;

    var projectedPropHeight = ~~(MazeGlobals.PROP_HEIGHT * MazeGlobals.PLAYER_DIST_TO_PROJ_PLANE / dist);
    var bottomOfProp = this.projectionPlaneYCenter + ~~(projectedPropHeight * 0.5);
    var topOfProp = MazeGlobals.PROJECTIONPLANEHEIGHT - bottomOfProp;
    var propWidth = projectedPropHeight; // assumes width and height of tile are the same

    // grab the appropriate prop image from collection
    var imageCanvas = this.questionPosData.getCanvasImage('?');  // initialize this to something
    if (propHit instanceof QuestionHitItem) {  // question items hit are treated like props
        // get '?', 'A', 'B', 'C', or 'D' and use it as an index to get pixels
        var ch = propHit.questionItemType;
        if (ch != '0') imageCanvas = this.questionPosData.getCanvasImage(ch);
    } else {
        var ch = this.propData.propData[propHit.mapPos];
        if (ch == '0') return;
        imageCanvas = this.propData.getCanvasImage(ch);
        if (imageCanvas == null) return;
    }

    // draw left side of prop
    var leftBound = (colMidProp - (propWidth >> 1));  // column number of left end of prop
    var rightBound = (colMidProp + (propWidth >> 1)); // column number of right end of prop
    for (var i = colMidProp; i >= 0 && i < MazeGlobals.PROJECTIONPLANEWIDTH && i >= leftBound; i--) {
        if (dist < this.clipper[i]) {   // make sure this slice isn't behind a wall... if behind wall, then clip
            var sliceOnImage = ~~(((i - leftBound) << MazeGlobals.TILE_SIZE_SHIFT) / propWidth);
            this.drawVertSliceOfImage(i, topOfProp, projectedPropHeight, imageCanvas.imageData, MazeGlobals.TILE_SIZE, sliceOnImage);
        }
    }

    // draw right side of prop
    for (var i = (colMidProp + 1); i >= 0 && i < MazeGlobals.PROJECTIONPLANEWIDTH && i < rightBound; i++) {
        if (dist < this.clipper[i]) {  // make sure this slice isn't behind a wall... if behind wall, then clip
            var sliceOnImage = ~~(((i - leftBound) << MazeGlobals.TILE_SIZE_SHIFT) / propWidth);
            this.drawVertSliceOfImage(i, topOfProp, projectedPropHeight, imageCanvas.imageData, MazeGlobals.TILE_SIZE, sliceOnImage);
        }
    }
};

//------------------------------------------------------------------------------
// Draws the landscape if we are casting within the right range.
//------------------------------------------------------------------------------
Maze.prototype.drawLandscape = function(castArc, castColumn) {
    'use strict';
    if (!this.curDest.usingALandscape) return;

    var offSetFromTop = this.curDest.landscapeOffsetFromTop;
    var offSetArc = this.curDest.landscapeStartAngle;
    var width = this.landscape.width;
    var height = this.landscape.height;
    var pixels = this.landscape.memPixels;

    if (castArc >= offSetArc && castArc < offSetArc + width) {
        for (var y = 0; y < height; y++) {
            var pixelPosition = ~~(width * y + (castArc - offSetArc)) * 4;
            var red = pixels.data[pixelPosition + 0];
            var green = pixels.data[pixelPosition + 1];
            var blue = pixels.data[pixelPosition + 2];
            var alpha = pixels.data[pixelPosition + 3];
            if (alpha != 0) {    // if not transparent
                this.setPixel(castColumn, offSetFromTop + y, red, green, blue)
            }
        }
    }
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
    var castArc = this.playerArc - this.trig.ANGLE30;
    if (castArc < 0)    // wrap around if necessary
	    castArc = this.trig.ANGLE360 + castArc;

    // initialize prop and clipper
    this.clipper = [];
    this.clipper.length = 0;
    for (var j = 0; j < MazeGlobals.PROJECTIONPLANEWIDTH; j++)
        this.clipper[j] = Number.MAX_VALUE;
    this.propHitItems = [];
    this.propHitItems.length = 0;

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
			this.drawLandscape(castArc, castColumn);
		    this.drawWallSlice(castColumn, closestHit);
	    }

	    // increment angle moving on to the next slice (remember ANGLE60 == PROJECTIONPLANEWIDTH)
	    castArc += this.SLICE_WIDTH;
	    if (castArc >= this.trig.ANGLE360)
			castArc -= this.trig.ANGLE360;

	    // we are done with these so enable garbase collection
	    horizWallHitItem = null;
	    vertWallHitItem = null;
    }

    // order the props and draw them
    this.propHitItems.sort(function(a, b) {return b.dist - a.dist;});
    for (var i = 0; i < this.propHitItems.length; i++) {
        this.castProp(this.propHitItems[i]);
    }

    if (this.curTrap != null && this.curTrap.usingOverlay) {
        this.overlay.copyOverlayTo(this.memPixels);
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
		dist /= this.trig.fishTable[castColumn];

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

        // grab the appropriate image from collection
        var ch = this.mapData.mapData[itemHit.mapPos]
        if (ch == '0') return;
        var imageCanvas = this.mapData.getCanvasImage(ch);
        if (imageCanvas == null) return;

		this.drawVertSliceOfImage(castColumn, topOfWall, projectedWallHeight, imageCanvas.imageData, MazeGlobals.TILE_SIZE, leftMostOfSlice);

        if (!this.propData.isProp(itemHit.mapPos))  // if this is a wall, save distance in clip array
            this.clipper[castColumn] = dist;        //  ...for use when drawing prop
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
	if ((this.playerArc -= this.trig.ANGLE10) < this.trig.ANGLE0)
		this.playerArc += this.trig.ANGLE360;
	this.setPlayerPos();
};

//------------------------------------------------------------------------------
// Rotate's player's angle right.
//------------------------------------------------------------------------------
Maze.prototype.rotateRight = function() {
    'use strict';
	if ((this.playerArc += this.trig.ANGLE10) >= this.trig.ANGLE360)
		this.playerArc -= this.trig.ANGLE360;
	this.setPlayerPos();
};

//------------------------------------------------------------------------------
// Sets the players x and y directions based upon the current angle.
//------------------------------------------------------------------------------
Maze.prototype.setPlayerPos = function() {
    'use strict';
    this.playerXDir = this.trig.cosTable[this.playerArc];
    this.playerYDir = this.trig.sinTable[this.playerArc];
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
// Check position to see if we are in a trap zone, if so, go to specified
// destination or perform the specified action.  Returns true if we are inside
// a trap, otherwise returns false.
//------------------------------------------------------------------------------
Maze.prototype.checkTraps = function(x, y) {
    var oldTrap = this.curTrap;
    this.curTrap = this.mazeConfig.insideATrap(x, y);
    if (this.curTrap == null) return false;
    if (this.curTrap == oldTrap) return true;  // is still in the same old trap don't do everything all over again

    if (this.curTrap.usingOverlay) {
        this.overlay.setOverlayFromTrap(this.mazeConfig.document, this.mazeConfig.mazeId, this.curTrap);
    }

    // go to a desination if available
    if (this.curTrap.usingDest) {
        var newDest = this.mazeConfig.advanceToDest(this.curTrap.gotoDest);
        if (newDest == null) return true;

        this.curDest = newDest;

        // if new destination has a new background, update background accordingly
        if (!newDest.useExistingBackground) {
            this.background.setBackgroundFromDest(this.mazeConfig.document, this.mazeConfig.mazeId, this.curDest);
        }

        // if new destination has a landscape, update accordingly
        if (!newDest.useExistingLandscape) {
            this.landscape.setLandscapeFromDest(this.mazeConfig.document, this.mazeConfig.mazeId, this.curDest);
        }

        this.playerX = this.curDest.xPos;
        this.playerY = this.curDest.yPos;

        // sometimes maze designer wants to keep player's current angle after advancing
        if (!this.curDest.useExistingAngle) {
            this.playerArc = this.curDest.angle;
            this.playerXDir = this.trig.cosTable[fPlayerArc];
            this.playerYDir = this.trig.sinTable[fPlayerArc];
        }
    }
    return true;
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
        this.checkTraps(this.playerX, this.playerY);
        return;
    }

    // can't move new x/y so just try x
    xGridIndex = newPlayerX >> MazeGlobals.TILE_SIZE_SHIFT;
    yGridIndex = this.playerY >> MazeGlobals.TILE_SIZE_SHIFT;    // keep old y
    mapIndex = this.mapData.convertPointToMapPos(xGridIndex, yGridIndex);
    if (mapIndex < (this.mapData.mapHeight << this.mapData.mapWidthShift) && !this.mapData.isWall(mapIndex)) {
        this.playerX = newPlayerX;
        this.checkTraps(this.playerX, this.playerY);
        return;
    }

    // just try y
    xGridIndex = this.playerX >> MazeGlobals.TILE_SIZE_SHIFT;    // keep old x
    yGridIndex = newPlayerY >> MazeGlobals.TILE_SIZE_SHIFT;
    mapIndex = this.mapData.convertPointToMapPos(xGridIndex, yGridIndex);
    if (mapIndex < (this.mapData.getMapHeight << this.mapData.mapWidthShift) && !this.mapData.isWall(mapIndex)) {
        this.playerY = newPlayerY;
        this.checkTraps(this.playerX, this.playerY);
        return;
    }
};



