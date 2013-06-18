//----------------------------------------------------------------------------------------------------------------------
// General math routines.
// @author brianpratt
//----------------------------------------------------------------------------------------------------------------------

// Namespace: MathUtils
if (MathUtils == null || typeof(MathUtils) != "object") {var MathUtils = new Object();}

//----------------------------------------------------------------------------------------------------------------------
// Returns a base 36 number based upon given parameter.  For example if input is 10 the return is "a" and if input is
// 17 the return is "h".
//----------------------------------------------------------------------------------------------------------------------
MathUtils.base10ToBase36 = function(i) {
    'use strict';
    var strBase36 = "";
    var aVal = 'a'.charCodeAt(0);
    if (i > 9) {
        var base36 = aVal + (i - 10);
        strBase36 = String.fromCharCode(base36);
    } else strBase36 = parseInt(i, 10);
    return strBase36;
};

//----------------------------------------------------------------------------------------------------------------------
// Returns a decimal number based upon a base 36 number for example if the input is an 'h' then return value is 17
// assumes all input data is lowercase.
//----------------------------------------------------------------------------------------------------------------------
MathUtils.base36ToBase10 = function(ch) {
    'use strict';
    var dec = 0;
    var chVal = ch.charCodeAt(0);
    var zeroVal = '0'.charCodeAt(0);
    var nineVal = '9'.charCodeAt(0);
    var aVal = 'a'.charCodeAt(0);
    if ((chVal >= zeroVal) && (chVal <= nineVal))
        dec = (chVal - zeroVal);
    if (chVal > nineVal)
        dec = (chVal - aVal) + 10;
    return dec;
};

//----------------------------------------------------------------------------------------------------------------------
// Power of two inverse:  for select values this method returns the power of two inverse (ie 64 returns 6 because 2
// to the 6th is 64).
//----------------------------------------------------------------------------------------------------------------------
MathUtils.logarithmBaseTwo = function(num) {
    'use strict';
    switch (num) {
        case 2:
            return 1;
        case 4:
            return 2;
        case 8:
            return 3;
        case 16:
            return 4;
        case 32:
            return 5;
        case 64:
            return 6;
        case 128:
            return 7;
        case 256:
            return 8;
        case 512:
            return 9;
        case 1024:
            return 10;
        default:
            return 6;
    }
};

