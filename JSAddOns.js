//--------------------------------------------------------------------------------------------------
// Defines JavaScript add on methods.
// @author brianpratt
//--------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------
// Add support for those browsers that don't support "forEach" (such as older internet explorer).
//--------------------------------------------------------------------------------------------------
(function () {
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(fun /*, thisp*/) {
            var len = this.length;
            if (typeof fun != "function")
                throw new TypeError();

            var thisp = arguments[1];
            for (var i = 0; i < len; i++) {
                if (i in this)
                    fun.call(thisp, this[i], i, this);
            }
        };
    }
}());

//--------------------------------------------------------------------------------------------------
// Add "findFirst" support to arrays.
//--------------------------------------------------------------------------------------------------
(function () {
    if (!Array.prototype.findFirst) {
        Array.prototype.findFirst = function (predicateCallback) {
            if (typeof predicateCallback !== 'function') {
                return undefined;
            }
            for (var i = 0; i < this.length; i++) {
                if (i in this && predicateCallback(this[i])) return this[i];
            }
            return undefined;
        };
    }
}());

//--------------------------------------------------------------------------------------------------
// For those browsers that don't support console.log() define a dummy version to prevent crashes.
//--------------------------------------------------------------------------------------------------
(function () {
    if (typeof console !== "object") {
        console = {log: function(){}};
    }
}());

