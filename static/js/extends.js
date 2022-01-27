var ucDropdownMenu = function(elementId, options) {
	var _this = this;
    var init = false;

    var element = ucUtil.get(elementId);
    var body = ucUtil.get('body');

    if (!element)  return;

    var defaultOptions = {
        toggle: 'click',
        hoverTimeout: 300,
        skin: 'light',
        height: 'auto',
        maxHeight: false,
        minHeight: false,
        persistent: false,
        mobileOverlay: true
    };
    
    var _plugin = {
    	
        construct: function(options) {
            if (ucUtil.data(element).has('dropdown')) {
                _this = ucUtil.data(element).get('dropdown');
            } else {
                _plugin.init(options);
                _plugin.setup();
                ucUtil.data(element).set('dropdown', _this);
            }

            return _this;
        },

        init: function(options) {
            _this.options = ucUtil.deepExtend({}, defaultOptions, options);
            _this.events = [];
            _this.eventHandlers = {};
            _this.open = false;
            
            _this.layout = {};
            _this.layout.close = ucUtil.find(element, '.is-dropdown-close');
            _this.layout.toggle = ucUtil.find(element, '.is-dropdown-toggle');
            _this.layout.arrow = ucUtil.find(element, '.is-dropdown-arrow');
            _this.layout.wrapper = ucUtil.find(element, '.is-dropdown-wrapper');
            _this.layout.defaultDropPos = ucUtil.hasClass(element, 'is-dropdown-up') ? 'up' : 'down';
            _this.layout.currentDropPos = _this.layout.defaultDropPos;

            if (ucUtil.attr(element, 'data-uc-dropdown') == "hover") {
                _this.options.toggle = 'hover';
            }
        },

        setup: function() {
            if (_this.options.placement) ucUtil.addClass(element, 'is-dropdown-' + _this.options.placement);
            if (_this.options.align) ucUtil.addClass(element, 'is-dropdown--align-' + _this.options.align);
            if (_this.options.width) ucUtil.css(_this.layout.wrapper, 'width', _this.options.width + 'px');
            if (ucUtil.attr(element, 'data-uc-dropdown-persistent') == '1') _this.options.persistent = true;
            if (_this.options.toggle == 'hover') ucUtil.addEvent(element, 'mouseout', _plugin.hideMouseout);

            _plugin.setZindex();
        },

        toggle: function() {
            if (_this.open) {
                return _plugin.hide();
            } else {
                return _plugin.show();
            }
        },

        setContent: function(content) {
            var content = ucUtil.find(element, '.is-dropdown-content').innerHTML = content;

            return _this;
        },

        show: function() {
            if (_this.options.toggle == 'hover' && ucUtil.hasAttr(element, 'hover')) {
                _plugin.clearHovered();
                return _this;
            }

            if (_this.open)  return _this;

            if (_this.layout.arrow) _plugin.adjustArrowPos();

            _plugin.eventTrigger('beforeShow');
            _plugin.hideOpened();

            ucUtil.addClass(element, 'is-dropdown-open');
            /*
            if (ucUtil.isMobileDevice() && _this.options.mobileOverlay) {
                var zIndex = ucUtil.css(element, 'z-index') - 1;

                var dropdownoff = ucUtil.insertAfter(document.createElement('DIV'), element );

                ucUtil.addClass(dropdownoff, 'is-dropdown-dropoff');
                ucUtil.css(dropdownoff, 'z-index', zIndex);
                ucUtil.data(dropdownoff).set('dropdown', element);
                ucUtil.data(element).set('dropoff', dropdownoff);

                ucUtil.addEvent(dropdownoff, 'click', function(e) {
                    _plugin.hide();
                    ucUtil.remove(this);
                    e.preventDefault();
                });
            }*/

            element.focus();
            element.setAttribute('aria-expanded', 'true');
            
            _this.open = true;

            ucUtil.scrollersUpdate(element);

            _plugin.eventTrigger('afterShow');

            return _this;
        },

        clearHovered: function() {
            var timeout = ucUtil.attr(element, 'timeout');

            ucUtil.removeAttr(element, 'hover');            
            ucUtil.removeAttr(element, 'timeout');

            clearTimeout(timeout);
        },

        hideHovered: function(force) {
            if (force === true) {
                if (_plugin.eventTrigger('beforeHide') === false) return;

                _plugin.clearHovered();
                ucUtil.removeClass(element, 'is-dropdown-open');
                _this.open = false;
                _plugin.eventTrigger('afterHide');
            } else {
                if (ucUtil.hasAttr(element, 'hover') === true) return;

                if (_plugin.eventTrigger('beforeHide') === false) return;

                var timeout = setTimeout(function() {
                    if (ucUtil.attr(element, 'hover')) {
                        _plugin.clearHovered();
                        ucUtil.removeClass(element, 'is-dropdown-open');
                        _this.open = false;
                        _plugin.eventTrigger('afterHide');
                    }
                }, _this.options.hoverTimeout);

                ucUtil.attr(element, 'hover', '1');            
                ucUtil.attr(element, 'timeout', timeout);
            }
        },

        hideClicked: function() {
            if (_plugin.eventTrigger('beforeHide') === false) return;

            ucUtil.removeClass(element, 'is-dropdown-open');
            ucUtil.data(element).remove('dropoff');
            _this.open = false;
            _plugin.eventTrigger('afterHide');
        },

        hide: function(force) {
            if (_this.open === false) return _this;

            if (ucUtil.isDesktopDevice() && _this.options.toggle == 'hover') {
                _plugin.hideHovered(force);
            } else {
                _plugin.hideClicked();
            }

            if (_this.layout.defaultDropPos == 'down' && _this.layout.currentDropPos == 'up') {
                ucUtil.removeClass(element, 'is-dropdown-up');
                _this.layout.arrow.prependTo(_this.layout.wrapper);
                _this.layout.currentDropPos = 'down';
            }

            return _this;
        },

        hideMouseout: function() {
            if (ucUtil.isDesktopDevice()) _plugin.hide();
        },

        hideOpened: function() {
            var query = ucUtil.findAll(body, '.uc-dropdown-menu.is-dropdown-open');
            
            for (var i = 0, j = query.length; i < j; i++) {
                var dropdown = query[i];
                ucUtil.data(dropdown).get('dropdown').hide(true);
            }
        },

        adjustArrowPos: function() {
            var width = ucUtil.outerWidth(element);
            var alignment = ucUtil.hasClass(_this.layout.arrow, 'is-dropdown--arrow-right') ? 'right' : 'left';
            var pos = 0;

            if (_this.layout.arrow) {
                if ( ucUtil.isInResponsiveRange('mobile') && ucUtil.hasClass(element, 'is-dropdown--mobile-full-width') ) {
                    pos = ucUtil.offset(element).left + (width / 2) - Math.abs( parseInt(ucUtil.css(_this.layout.arrow, 'width')) / 2) - parseInt(ucUtil.css(_this.layout.wrapper, 'left'));
                    
                    ucUtil.css(_this.layout.arrow, 'right', 'auto');
                    ucUtil.css(_this.layout.arrow, 'left', pos + 'px');                    
                    ucUtil.css(_this.layout.arrow, 'margin-left', 'auto');
                    ucUtil.css(_this.layout.arrow, 'margin-right', 'auto');
                    
                } else if (ucUtil.hasClass(_this.layout.arrow, 'is-dropdown--arrow-adjust')) {
                    pos = width / 2 - Math.abs( parseInt(ucUtil.css(_this.layout.arrow, 'width')) / 2);
                    
                    if (ucUtil.hasClass(element, 'is-dropdown--align-push')) pos = pos + 20;

                    if (alignment == 'right') {
                        if (ucUtil.isRTL()) {
                            ucUtil.css(_this.layout.arrow, 'right', 'auto');
                            ucUtil.css(_this.layout.arrow, 'left', pos + 'px');
                        } else {
                            ucUtil.css(_this.layout.arrow, 'left', 'auto');
                            ucUtil.css(_this.layout.arrow, 'right', pos + 'px');
                        }
                    } else {
                        if (ucUtil.isRTL()) {
                            ucUtil.css(_this.layout.arrow, 'left', 'auto');
                            ucUtil.css(_this.layout.arrow, 'right', pos + 'px');
                        } else {
                            ucUtil.css(_this.layout.arrow, 'right', 'auto');
                            ucUtil.css(_this.layout.arrow, 'left', pos + 'px');
                        }                       
                    }
                }
            }
        },

        setZindex: function() {
            var zIndex = 101;
            var newZindex = ucUtil.getHighestZindex(element);
            
            if (newZindex >= zIndex) zIndex = newZindex + 1;
            
            ucUtil.css(_this.layout.wrapper, 'z-index', zIndex);
        },

        isPersistent: function() {
            return _this.options.persistent;
        },

        isShown: function() {
            return _this.open;
        },

        eventTrigger: function(name, args) {
            for (var i = 0; i < _this.events.length; i++) {
                var event = _this.events[i];
                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            _this.events[i].fired = true;
                            event.handler.call(this, _this, args);
                        }
                    } else {
                        event.handler.call(this, _this, args);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            _this.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });
        }
    };

    _this.setDefaults = function(options) { defaultOptions = options; };
    _this.show = function() { return _plugin.show(); };
    _this.hide = function() { return _plugin.hide(); };
    _this.toggle = function() { return _plugin.toggle(); };
    _this.isPersistent = function() { return _plugin.isPersistent(); };
    _this.isShown = function() { return _plugin.isShown(); };
    _this.setContent = function(content) { return _plugin.setContent(content); };
    _this.on = function(name, handler) { return _plugin.addEvent(name, handler); };
    _this.one = function(name, handler) { return _plugin.addEvent(name, handler, true); };

    _plugin.construct.apply(_this, [options]);

    init = true;

    return _this;
}

ucUtil.on(document, '[data-uc-dropdown="click"] .is-dropdown-toggle', 'click', function(e) {
    var element = this.closest('.uc-dropdown-menu');  
    var dropdown;

    if (element) {
        if (ucUtil.data(element).has('dropdown')) {
            dropdown = ucUtil.data(element).get('dropdown');
        } else {                 
            dropdown = new ucDropdownMenu(element);
        }            
        dropdown.toggle();
        e.preventDefault();
    } 
});
ucUtil.on(document, '[data-uc-dropdown-close]', 'click', function(e) {
    var element = this.closest('.uc-dropdown-menu');  
    var dropdown;

    if (element) {
        if (ucUtil.data(element).has('dropdown')) {
            dropdown = ucUtil.data(element).get('dropdown');
        } else {                 
            dropdown = new ucDropdownMenu(element);
        }            
        dropdown.toggle();
        e.preventDefault();
    } 
});
ucUtil.on(document, '[data-uc-dropdown="hover"] .is-dropdown-toggle', 'click', function(e) {
    if (ucUtil.isDesktopDevice()) {
        if (ucUtil.attr(this, 'href') == '#') {
            e.preventDefault();
        }
    } else if (ucUtil.isMobileDevice()) {
        var element = this.closest('.uc-dropdown-menu');
        var dropdown;
        if (element) {
            if (ucUtil.data(element).has('dropdown')) {
                dropdown = ucUtil.data(element).get('dropdown');
            } else {                        
                dropdown = new ucDropdownMenu(element);
            }  
            dropdown.toggle();
            e.preventDefault();
        }
    }
});

ucUtil.on(document, '[data-uc-dropdown="hover"]', 'mouseover', function(e) {
    if (ucUtil.isDesktopDevice()) {
        var element = this;
        var dropdown;
        if (element) {
            if (ucUtil.data(element).has('dropdown')) {
                dropdown = ucUtil.data(element).get('dropdown');
            } else {                        
                dropdown = new ucDropdownMenu(element);
            }
            dropdown.show();
            e.preventDefault();
        }
    }
});

document.addEventListener("click", function(e) {
    var query;
    var body = ucUtil.get('body');
    var target = e.target;
    
    if (query = body.querySelectorAll('.uc-dropdown-menu.is-dropdown-open')) {
        for (var i = 0, len = query.length; i < len; i++) {
            var element = query[i];
            if (ucUtil.data(element).has('dropdown') === false) {
                return;
            }

            var _this = ucUtil.data(element).get('dropdown');
            var toggle = ucUtil.find(element, '.is-dropdown-toggle');
			
            if (ucUtil.hasClass(element, 'is-dropdown--disable-close')) {
                e.preventDefault();
                e.stopPropagation();
            }

            if (toggle !== toggle && target.contains(toggle) === false) {
                if (_this.isPersistent() === false) {
                    _this.hide();
                } 
            } else if (element.contains(target) === false) {
                _this.hide();
            }
        }
    }
});