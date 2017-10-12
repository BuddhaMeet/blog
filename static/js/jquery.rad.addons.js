;(function($, window, document, undefined) {

if (!window.console) {
    window.console = { log: function() {} };
}

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(obj) {
		var i, elem, l = this.length;
		for (i = 0; i < l; i++) {
			elem = this[i];
			if (elem === obj) {
				return i;
			}
		}
		return -1;
	};
}

if (!String.prototype.sprintf) {
    String.prototype.sprintf = function() {
    	var str = this.substring(0, this.length),
    		repl = arguments[0];
    	var token, regex, i;
    	
    	// we're given an array
    	//
    	//  >>> t = "%s (%s/%s)";
    	//  >>> t.sprintf(["ampelia", 1, 10]);
    	//  'ampelia 1/10'
    	if ($.isArray(repl)) {
    		for (i = 0; i < repl.length; i++) {
    			str = str.replace(/%s/, repl[i]);
    		}
    		return str;
    	
    	// we're given an object
    	//
    	//  >>> t = "%(first)s (%(second)s/%(third)s)";
    	//  >>> t.sprintf({ first: "ampelia", second: 1, third: 10 });
    	//  'ampelia 1/10'
    	} else {
    		for (token in repl) {
    			regex = new RegExp('%\\(' + token + '\\)s', 'g');
    			str = str.replace(regex, repl[token]);
    		}
    		return str;
    	}
    };
}

$.fixIEAA = function() {
	if ($.browser.msie) {
		this.style.removeAttribute('filter');
    }
};

$.isNumber = function(value) {
	return typeof value === 'number';
};

$.isUndefined = function(value) {
	return typeof value === 'undefined';
};

$.isNull = function(value) {
	return typeof value === 'null';
};

$.isNot = function(value) {
	return $.isUndefined(value) || $.isNull(value);
};

})(jQuery, this, this.document);
