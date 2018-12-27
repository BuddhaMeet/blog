;(function($) {

$.event.special.mousedownoutside = {
  add: function(cb) {
    var self = this,
        name = 'mousedown.mousedownoutside' + cb.guid.toString();
    
    $(this).on(name, function(e) {
      e.stopPropagation();
    });
    
    $('body').on(name, function(e) {
      var event = $.extend({}, e, {type: 'mousedownoutside'});
      cb.handler.apply(self, [event]);
    });
  },
  
  remove: function(cb) {
    var self = this,
        name = 'mousedown.mousedownoutside' + cb.guid.toString();
    
    $(this).off(name);
    $('body').off(name);
  }
};

$.fn.extend({
  mousedownoutside: function(fn) {
    return fn ? this.on('mousedownoutside', fn) : this.trigger('mousedownoutside');
  },
  
  unmousedownoutside: function(fn) {
    return this.off('mousedownoutside', fn);
  }
});

})(jQuery);