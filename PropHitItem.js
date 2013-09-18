//----------------------------------------------------------------------------------------------------
// A hit item used to describe where a ray hits a prop.  To use an object of
// this type, call the constructor, then call setPropHitItemData() to
// establish state.
//
// @author brianpratt
//----------------------------------------------------------------------------------------------------

// Namespace: PropHitItem
if (PropHitItem == null || typeof(PropHitItem) != "object") {var PropHitItem = new Object();}

//------------------------------------------------------------------------------
// constructor
//------------------------------------------------------------------------------
PropHitItem = function(mapPos, trig){
    'use strict';
    this.mapPos = mapPos;
    this.dist = -1;
    this.colMidProp = -1;
    this.trig = trig;
};

PropHitItem.prototype.mapPos = 0;            // x and y converted to one dimensional (y * mapWidth) + x
PropHitItem.prototype.dist = -1;
PropHitItem.prototype.colMidProp = -1;
PropHitItem.prototype.trig;

//----------------------------------------------------------------------------------------------------
// Calculates dist from player to prop and determines which column will be the prop's mid-point.
// Sets prototype variables and state accordingly.
//----------------------------------------------------------------------------------------------------
PropHitItem.prototype.setPropHitItemData = function (mapData, playerX, playerY, playerArc) {
    'use strict';
    var x1 = playerX;
    var y1 = playerY;

    // get mid point of prop
    var row = this.mapPos >> mapData.mapWidthShift;
    var col = (~~this.mapPos) % mapData.mapWidth;
    var x2 = (col << MazeGlobals.TILE_SIZE_SHIFT) + (MazeGlobals.TILE_SIZE >> 1);
    var y2 = (row << MazeGlobals.TILE_SIZE_SHIFT) + (MazeGlobals.TILE_SIZE >> 1);

    // compute distance between player and prop
    var dist = 0;
    var xRel = x1 - x2;   // xRel: relative x diff from players's perspective
    var yRel = y1 - y2;
    if (0 == yRel) dist = Math.abs(xRel);
    else dist = ~~(Math.sqrt(Math.abs(xRel * xRel + yRel * yRel)));

    // determine angle defined by line between prop and pl
    var ang = 0;
    if ((y1 == y2) && (x1 - x2 < 0)) ang = 0;
    else if ((x1 == x2) && (y1 - y2 < 0)) ang = 90;
    else if ((y1 == y2) && (x1 - x2 > 0)) ang = 180;
    else if ((x1 == x2) && (y1 - y2 > 0)) ang = 270;
    else {
        var supAng = 0;    // must add supplemental angle to rotate to the correct quadrant
        if ((x1 < x2) && (y1 < y2)) supAng = 0;
        else if ((x1 > x2) && (y1 < y2)) supAng = 180;    // atan in this region should be neg
        else if ((x1 > x2) && (y1 > y2)) supAng = 180;
        else if ((x1 < x2) && (y1 > y2)) supAng = 360;    // atan in this region should be neg
        else return;      // should not be possible: x1 = x2 and y1 = y2

        var angleRad = Math.atan(yRel / xRel);
        var angleDegrees = Trig.radToDegrees(angleRad);

        ang = angleDegrees + supAng;
    }
    var angMazeUnits = ~~(ang * this.trig.ANGLE60 / 60);  // convert to maze angle units

    // if angle difference is huge then it is likely we simply wrapped around from 0 to 360 degrees
    var playerArcTemp = playerArc;
    if (playerArcTemp > this.trig.ANGLE270 && angMazeUnits < this.trig.ANGLE90)
        playerArcTemp -= this.trig.ANGLE360;
    if (angMazeUnits > this.trig.ANGLE270 && playerArcTemp < this.trig.ANGLE90)
        angMazeUnits -= this.trig.ANGLE360;
    var colMidPropTemp = ~~((MazeGlobals.PROJECTIONPLANEWIDTH >> 1) - (playerArcTemp - angMazeUnits));

    // adjust distance to avoid fish eye
    if (colMidPropTemp >= 0 && colMidPropTemp < MazeGlobals.PROJECTIONPLANEWIDTH)
        dist /= this.trig.fishTable[colMidPropTemp];     // use table when possible
    else
        dist /= (1.0 / Math.cos(this.trig.arcToRad(ang)));

    this.dist = dist;
    this.colMidProp = colMidPropTemp;
};

