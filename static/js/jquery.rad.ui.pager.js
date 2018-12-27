;(function($, window, document, undefined) {

var Pager = {
  options: {
    items: 'li',    // the selector to the items to paginate -- required
    
    cycle: false,   // whether to cycle back to beginning when
                    // reaching the last element
    
    page: null,     // the current page
    paginateBy: 1,  // how many items to move per page
    perPage: 1,     // how many items are visible at any given time
    
    elementClass: 'pager',
    itemClass: 'page',
    currentClass: 'current',
    
    // callbacks
    init: null,
    
    // events
    change: null,
    next: null,
    previous: null,
    cycled: null
  },
  
  _create: function() {
    this.element.addClass(this.options.elementClass);
  },
  
  _destroy: function() {
    this.element.removeClass(this.options.elementClass);
  },
  
  _init: function() {
    this.items(this.options.items);
    this._trigger('init');
  },
  
  _setOption: function(key, value) {
    switch (key) {
      case 'page':
        this._showPage(value);
        break;
      default:
        break;
    }
    
    return this._super(key, value);
  },
  
  // internal
  
  _showPage: function(index) {
    var self = this,
        opts = this.options,
        curpage = this._page(),
        dir = curpage != null ? curpage - index : 0 - index,
        cycled = opts.cycle && (Math.abs(dir) === this._pageCount() - 1);
    
    if (curpage != null && dir === 0)
      return;
    
    if (Math.abs(dir) === this._pageCount() - 1)
      dir = -1 * dir;
    if (this._pageCount() - 1 == 1)
      dir = -1 * dir;
    
    this._page(index);
    
    this._trigger('change', null, [{
      page:               index,
      previousPage:       curpage,
      pageCount:          this._pageCount(),
      pageItems:          this._itemsOnPage(index),
      previousPageItems:  $.isNull(curpage) ? $() : this._itemsOnPage(curpage),
      direction:          dir > 0 ? -1 : 1,
      cycled:             cycled,
      paginateBy:         opts.paginateBy,
      perPage:            opts.perPage
    }]);
    
    if (cycled)
      this._trigger('cycled', null, [
        dir > 0 ? -1 : 1, // direction
        this._pageCount() // pagecount
      ]);
    else
      this._trigger(dir > 0 ? 'previous' : 'next');
  },
  
  _showNext: function() {
    if (!this._hasNext()) {
      if (this.options.cycle)
        return this._showPage(0);
      return null;
    }
    return this._showPage(this._page() + 1);
  },
  
  _showPrevious: function() {
    if (!this._hasPrevious()) {
      if (this.options.cycle)
        return this._showPage(this._pageCount() - 1);
      return null;
    }
    return this._showPage(this._page() - 1);
  },
  
  _hasNext: function() {
    return this._page() < this._pageCount() - 1;
  },
  
  _hasPrevious: function() {
    return this._page() > 0;
  },
  
  // get/set
  
  _page: function(index) {
    if ($.isNot(index))
      return this.options.page;
    this.options.page = index;
    return null;
  },
  
  _pageCount: function() {
    return Math.ceil((this._items().length - this.options.perPage) / this.options.paginateBy) + 1;
  },
  
  _items: function(value) {
    if ($.isNot(value))
      return this.options.items;
    this.options.items = $(value, this.element.get(0)).addClass(this.itemClass);
    return null;
  },
  
  _itemsOnPage: function(index) {
    var pby = this.options.paginateBy;
    if ($.isNot(index))
      index = this._page();
    return this._items().slice(index * pby, (index + 1) * pby);
  },
  
  // public
  
  items: function(value) {
    if ($.isNot(value))
      return this._items();
    if ($.isNumber(value))
      return this._itemsOnPage(value);
    this._items(value);
    return this;
  },
  
  page: function(index) {
    if ($.isNot(index))
      return this._page();
    this._showPage(parseInt(index, 10));
    return this;
  },
  
  hasNext: function() {
    return this._hasNext();
  },
  
  hasPrevious: function() {
    return this._hasPrevious();
  },
  
  next: function() {
    this._showNext();
    return this;
  },
  
  previous: function() {
    this._showPrevious();
    return this;
  }
};

var PagerNav = {
  options: {
    node: null,
    nextButton: '.next',
    previousButton: '.previous',
    disabledClass: 'disabled'
  },
  
  _create: function() {
    var self = this,
        opts = this.options,
        pager = this.element.data('radPager');
    
    this.pager = pager;
    
    this._on(pager.widget(), {
      pagerchange: function(e, ui) {
        self.refresh();
      }
    });
    
    this.p = $(opts.previousButton, $(opts.node, pager.widget()).get(0));
    this._on(this.p, {
      click: function(e) {
        e.preventDefault();
        self.pager.previous();
      }
    });
    
    this.n = $(opts.nextButton, $(opts.node, pager.widget()).get(0));
    this._on(this.n, {
      click: function(e) {
        e.preventDefault();
        self.pager.next();
      }
    });
  },
  
  _init: function() {
    this.refresh();
  },
  
  refresh: function() {
    var pager = this.pager,
        cssclass = this.options.disabledClass;
    
    if (pager.options.cycle && (pager.hasPrevious() || pager.hasNext())) {
      this.p.removeClass(cssclass);
      this.n.removeClass(cssclass);
      return;
    }
    
    if (pager.hasPrevious())
      this.p.removeClass(cssclass);
    else
      this.p.addClass(cssclass);
    
    if (pager.hasNext())
      this.n.removeClass(cssclass);
    else
      this.n.addClass(cssclass);
  }
};

var PagerWheel = {
  options: {
    threshold: 0.3,
    coalescingTimeDelta: 200,
    
    // callbacks
    init: null
  },
  
  _create: function() {
    var self = this;
    
    this._tid = null;
    this.pager = this.element.data('radPager');
    
    this.pager.widget()
      .on('mousewheel.pagerwheel', function(e, delta, dX, dY) {
        var threshold = self.options.threshold,
            coaldelta = self.options.coalescingTimeDelta;
        if (delta > threshold || delta < -1 * threshold) {
          clearTimeout(self._tid);
          self._tid = setTimeout(function() {
            if (delta > threshold)
              self.pager.previous();
            else if (delta < -1 * threshold)
              self.pager.next();
          }, coaldelta);
        }
      });
  },
  
  _destroy: function() {
    clearTimeout(this._tid);
    this.pager.widget().off('mousewheel.pagerwheel');
  },
  
  destroy: function() {
    this._destroy();
    $.Widget.prototype.destroy.call(this);
  },
  
  _init: function() {
    this._trigger('init');
  }
};

var Paginator = {
  options: {
    node: null,
    buttons: 'a',
    currentClass: 'current'
  },
  
  _create: function() {
    var self = this;
    
    this.pager = this.element.data('radPager');
    
    this.pager.widget()
      .on('pagerchange.paginator', function(e, ui) {
        $(self.options.node, self.pager.widget())
          .find(self.options.buttons)
            .removeClass(self.options.currentClass)
            .eq(ui.page)
              .addClass(self.options.currentClass)
          .end();
      });
    
    $(self.options.node, self.pager.widget())
      .on('click.paginator', this.options.buttons, function(e) {
        var button = $(e.target);
        e.preventDefault();
        self.pager.page(parseInt(button.text(), 10) - 1);
      });
  },
  
  _destroy: function() {
    this.pager.widget().off('pagerchange.paginator');
    $(self.options.node).off('click.paginator', this.options.buttons);
  },
  
  destroy: function() {
    this._destroy();
    $.Widget.prototype.destroy.call(this);
  }
};

var Slideshow = {
  options: {
    interval: 6000,
    autostart: true,
    
    // callbacks
    init: null
  },
  
  _create: function() {
    var self = this;
    
    this._tid = null;
    this._active = this.options.autostart;
    this._bypass = false;
    
    this.pager = this.element.data('radPager');
    
    if (this.options.autostart)
      this.start();
  },
  
  _destroy: function() {
    this.stop();
  },
  
  destroy: function() {
    this._destroy();
    $.Widget.prototype.destroy.call(this);
  },
  
  _init: function() {
    this._trigger('init');
  },
  
  _schedule: function() {
    var self = this;
    
    clearInterval(this._tid);
    
    this._tid = setInterval(function() {
      self._bypass = true;
      self.pager.next();
      self._bypass = false;
    }, this.options.interval);
  },
  
  active: function(val) {
    if ($.isNot(val))
      return this._active;
    if (!!val)
      this.start();
    else
      this.stop();
    return null;
  },
  
  start: function() {
    var self = this;
    this._active = true;
    this._schedule();
    this.pager.widget()
      .on('pagerchange.slideshow', function(e, ui) {
        if (!self._bypass)
          self.stop();
      });
    this._trigger('start');
  },
  
  stop: function() {
    this.pager.widget().off('pagerchange.slideshow');
    clearInterval(this._tid);
    this._active = false;
    this._trigger('stop');
  }
};

$.widget('rad.pager', Pager);
$.widget('rad.pagernav', PagerNav);
$.widget('rad.pagerwheel', PagerWheel);
$.widget('rad.paginator', Paginator);
$.widget('rad.slideshow', Slideshow);

})(jQuery, this, this.document);