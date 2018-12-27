;(function($, window, document, undefined) {

var TabBar = {
    options: {
        currentClass: 'current',
        
        // callbacks
        init: null,
        
        // events
        change: function(e, buckets) {
            buckets[1] && $(buckets[1]).hide();
            $(buckets[0]).show();
        }
    },
    
    _create: function() {
        var self = this;
        
        this.element.delegate('a', 'click', function(e) {
            e.preventDefault();
            if (self._xhr !== null)
                self._xhr.abort();
            var $tab = $(this),
                url = $tab.attr('href');
            if ($tab.attr('ajax'))
                self._fromAjax($tab);
            else
                self._showBucket(url);
        });
    },
    
    _init: function() {
        var self = this,
            opts = this.options;
        
        this._xhr = null;
        this._current = null;
        
        this.element.find('a').each(function() {
            var $tab = $(this),
                $bucket = self._getBucket($(this).attr('href'));
            if ($bucket.length > 0) {
                $bucket.hide();
                $tab.hasClass(opts.currentClass) && $tab.click();
            }
        });
        
        this._trigger('init');
        
        this._fromHash();
    },
    
    _destroy: function() {
        if (this._xhr !== null)
            this._xhr.abort();
        this.element.undelegate('a', 'click');
    },
    
    destroy: function() {
        this._destroy();
        $.Widget.prototype.destroy.call(this);
    },
    
    _setOption: function(key, value) {
        switch (key) {
            default:
                break;
        }
        
        this._super('_setOption', key, value);
    },
    
    // internal
    
    _getBucket: function(id) {
        return $(id);
    },
    
    _showBucket: function(id) {
        if (!id)
            return;
        if (this._current === id)
            return;
        
        var self = this,
            opts = this.options,
            $elem = this.element;
        
        var $newBucket = this._getBucket(id),
            $previousBucket = this._current && this._getBucket(this._current);
        
        var $newTab = $elem.find('a[href="' + id + '"]'),
            $previousTab = this._current && $elem.find('a.' + opts.currentClass + '');
        
        $previousTab && $previousTab.removeClass(opts.currentClass);
        $newTab.addClass(opts.currentClass);
        this._current = id;
        
        var buckets = [$newBucket.get(0)];
        if ($previousBucket)
            buckets.push($previousBucket.get(0));
        
        this._trigger('change', null, [buckets]);
    },
    
    _fromAjax: function($tab) {
        var self = this,
            url = $tab.attr('ajax'),
            id = $tab.attr('href');
        
        $tab.addClass('loading');
        
        this._xhr = $.ajax({
            url: url,
            success: function(response) {
                self._getBucket(id).html(response);
                $tab
                    .removeClass('loading')
                    .removeAttribute('ajax');
                self._showBucket(id);
                self._xhr = null;
            },
            failure: function() {
                alert('An error occured, please reload the page');
            }
        });
    },
    
    _fromHash: function() {
        // find which tab should be open
        var c = window.location.hash.substr(1);
        // select the tab specified in the url hash...
        this.element.find('a[href="#' + c + '"]').click();
        // ...or select the first tab
        this._current == null && this.element.find('a').first().click();
    },
    
    // public
    
    current: function() {
        return this.element.find('a.' + this.options.currentClass + '').eq(0);
    },
    
    next: function(cycle) {
        var $all = this.element.find('a'),
            $cur = this.current(),
            $next;
        
        for (var i = 0; i < $all.length; i++) {
            if ($all.eq(i).attr('href') == $cur.attr('href')) {
                if (i < $all.length - 1)
                    $next = $all.eq(i+1);
                else if (cycle)
                    $next = $all.eq(0);
                else
                    return;
                break;
            }
        };
        
        if ($next)
            $next.click();
    }
};

$.widget('rad.tabbar', TabBar);

})(jQuery, this, this.document);
