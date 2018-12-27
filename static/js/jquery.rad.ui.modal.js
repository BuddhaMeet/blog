;(function($, window, document, undefined) {

var Modal = {
  options: {
    content: null,    // one of: url, selector
    contentType: null,  // one of: ajax, image, div
    
    elementClass: 'modal',
    
    contentSelector: '.modal-content',
    contentWrapperSelector: '.modal-content-wrapper',
    thinkerSelector: '.modal-thinker',
    closeButtonSelector: '.modal-close',
    
    // callbacks
    init: null,
    
    // events
    open: null,
    close: null,
    load: null,
    unload: null
  },
  
  _create: function() {
    var self = this;
    this.element.addClass(this.options.elementClass).hide();
    
    this._xhr = null;
    
    this._content = $(this.options.contentSelector, this.element[0]);
    this._contentWrapper = $(this.options.contentWrapperSelector, this.element[0]);
    this._thinker = $(this.options.thinkerSelector, this.element[0]);
    this._closebutton = $(this.options.closeButtonSelector, this.element[0]);
    
    this.element
      .on('click.modal-close', this.options.closeButtonSelector, function(e) {
        e.preventDefault();
        self._close();
      })
      .on('click.modal-overlay', this.options.contentWrapperSelector, function(e) {
        self._close();
      })
      .on('click.modal-content', this.options.contentSelector, function(e) {
        e.stopPropagation();
      });
  },
  
  _destroy: function() {
    this.element
      .off('click.modal-close')
      .off('click.modal-overlay')
      .off('click.modal-content')
      .removeClass(this.options.elementClass);
    $('html').removeClass('modal-open');
  },
  
  destroy: function() {
    this._destroy();
    $.Widget.prototype.destroy.call(this);
  },
  
  _init: function() {
    this._closebutton.fadeOut(0);
    this._thinker.fadeOut(0);
    this._trigger('init');
    
    if (this.options.content && this.options.contentType)
      this._load(this.options.content, this.options.contentType);
  },
  
  // internal
  
  _load: function(urlOrSelector, type) {
    if (this._xhr !== null)
      return;
    
    this._content.html('');
    
    switch (type) {
      case 'image':
        this._loadImage(urlOrSelector);
        break;
      case 'ajax':
        this._loadAjax(urlOrSelector);
        break;
      case 'div':
        this._loadDiv(urlOrSelector);
        break;
      default:
        break;
    }
  },
  
  _loadAjax: function(url) {
    var self = this;
    
    this._startLoading();
    
    this._xhr = $.ajax({
      url: url,
      type: 'GET',
      dataType: 'html',
      cache: false
    }).done(function(data) {
      self._content.html(data);
      self._xhr = null;
      self._finishLoading();
    }).fail(function() {
      self._xhr = null;
    });
  },
  
  _loadImage: function(url) {
    var self = this,
      img = $(new Image());
    
    img.load(function() {
      self._content.html('').append(img).fadeOut(0);
      self._finishLoading();
    });
    
    this._startLoading();
    img.attr('src', url);
  },
  
  _loadDiv: function(selector) {
    var self = this;
    
    this._startLoading();
    this._content.html('').append($(selector).clone());
    this._finishLoading();
  },
  
  _startLoading: function() {
    this._closebutton.hide();
    this._contentWrapper.hide();
    this._trigger('unload', null, [
      this._content[0]
    ]);
    this._open();
    this._thinker.fadeIn(300);
  },
  
  _finishLoading: function(yield) {
    var self = this;
    
    var cb = function() {
      if (yield)
        yield();
    };
    
    this._thinker.delay(500).fadeOut(300, function() {
      self._contentWrapper.fadeIn(300, function() {
        self._closebutton.delay(500).fadeIn(200);
        self._trigger('load', null, [
          cb,
          self._content[0],
          self.options.content,
          self.options.contentType
        ]);
      });
    });
  },
  
  _html: function(html) {
    if ($.isNot(html)) // looks for undefined and null
      return this._content.html();
    this._content.html(html);
    return null;
  },
  
  _open: function() {
    $('html').addClass('modal-open');
    this.element.fadeIn(150);
    this._trigger('open');
  },
  
  _close: function() {
    this._closebutton.fadeOut(100);
    this.element.fadeOut(150);
    $('html').removeClass('modal-open');
    this._trigger('close');
  },
  
  // public
  
  open: function() {
    this._open();
  },
  
  close: function() {
    this._close();
  },
  
  load: function(urlOrSelector, type) {
    this._load(urlOrSelector, type);
  }
};

$.widget('rad.modal', Modal);

})(jQuery, this, this.document);
