/* UMD Module */
(function (global, factory) {

	typeof define === 'function' && define.amd ? define(['jquery'], factory) : //AMD
		typeof module === 'object' && module.exports ? module.exports = factory(require('jquery')) : //CommonJS
			global.ucSlipout = factory(global.$); //Window

}(this, function ($) {
	
	"use strict";
	
	var NAME = 'ucSlipout';
	var DATA_KEY = 'uc.slipout';
	var EVENT_KEY = "." + DATA_KEY;
	var DATA_API_KEY = '.data-api';
	var JQUERY_NO_CONFLICT = $.fn[NAME];
	
	var AttachmentMap = {
		TOP: '-top',
		BOTTOM: '-bottom',
		RIGHT: '-right',
		LEFT: '-left',
		TOP_PUSH: '-top-push',
		BOTTOM_PUSH: '-bottom-push',
		RIGHT_PUSH: '-right-push',
		LEFT_PUSH: '-left-push'
	};

	var Default = {
		backdrop: true,
		keyboard: true,
		focus: true,
		show: true
	};

	var DefaultType = {
		backdrop: '(boolean|string)',
		keyboard: 'boolean',
		focus: 'boolean',
		show: 'boolean'
	};

	var Event = {
		HIDE: "hide" + EVENT_KEY,
		HIDDEN: "hidden" + EVENT_KEY,
		SHOW: "show" + EVENT_KEY,
		SHOWN: "shown" + EVENT_KEY,
		FOCUSIN: "focusin" + EVENT_KEY,
		RESIZE: "resize" + EVENT_KEY,
		CLICK_DISMISS: "click.dismiss" + EVENT_KEY,
		KEYDOWN_DISMISS: "keydown.dismiss" + EVENT_KEY,
		MOUSEUP_DISMISS: "mouseup.dismiss" + EVENT_KEY,
		MOUSEDOWN_DISMISS: "mousedown.dismiss" + EVENT_KEY,
		CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
	};

	var ClassName = {
		SCROLLBAR_MEASURER: 'uc-slipout--scrollbar-measure',
		BACKDROP: 'is-slipout-backdrop',
		OPEN: 'is-slipout--open',
		FADE: 'is-fade',
		SHOW: 'is-show'
	};

	var Selector = {
		DIALOG: '.is-slipout-dialog',
		DATA_TOGGLE: '[data-uc-click="slipout"]',
		DATA_DISMISS: '[data-uc-dismiss="slipout"]'
	};
	
	var ucSlipout = 
	/*#__PURE__*/
	function () {
		function ucSlipout(element, config) {
			this._config = this._getConfig(config);
			this._element = element;
			this._dialog = element.querySelector(Selector.DIALOG);
			this._backdrop = null;
			this._isShown = false;
			this._isBodyOverflowing = false;
			this._ignoreBackdropClick = false;
			this._scrollbarWidth = 0;
		}

		var _proto = ucSlipout.prototype;

		_proto.toggle = function toggle(relatedTarget) {
			return this._isShown ? this.hide() : this.show(relatedTarget);
		};

		_proto.show = function show(relatedTarget) {
			var _this = this;
			
			if (this._isTransitioning || this._isShown) return;
			if ($(this._element).hasClass(ClassName.FADE)) this._isTransitioning = true;

			var showEvent = $.Event(Event.SHOW, {
				relatedTarget: relatedTarget
			});

			$(this._element).trigger(showEvent);

			if (this._isShown || showEvent.isDefaultPrevented()) return;

			this._isShown = true;

			this._checkScrollbar();
			this._setScrollbar();
			this._adjustDialog();

			$(document.body).addClass(ClassName.OPEN + _this._getPlacement());

			this._setEscapeEvent();
			this._setResizeEvent();

			$(this._element).on(Event.CLICK_DISMISS, Selector.DATA_DISMISS, function (event) {
				return _this.hide(event);
			});

			$(this._dialog).on(Event.MOUSEDOWN_DISMISS, function () {
				$(_this._element).one(Event.MOUSEUP_DISMISS, function (event) {
					if ($(event.target).is(_this._element)) {
						_this._ignoreBackdropClick = true;
					}
				});
			});

			this._showBackdrop(function () {
				return _this._showElement(relatedTarget);
			});
		};

		_proto.hide = function hide(event) {
			var _this2 = this;

			if (event)
				event.preventDefault();

			if (this._isTransitioning || !this._isShown)
				return;

			var hideEvent = jQuery.Event(Event.HIDE);

			jQuery(this._element).trigger(hideEvent);

			if (!this._isShown || hideEvent.isDefaultPrevented())
				return;

			this._isShown = false;
			var transition = jQuery(this._element).hasClass(ClassName.FADE);

			if (transition)
				this._isTransitioning = true;

			this._setEscapeEvent();
			this._setResizeEvent();

			jQuery(document).off(Event.FOCUSIN);
			jQuery(this._element).removeClass(ClassName.SHOW);
			jQuery(this._element).off(Event.CLICK_DISMISS);
			jQuery(this._dialog).off(Event.MOUSEDOWN_DISMISS);

			if (transition) {
				var transitionDuration = ucUtil.getTransitionDurationFromElement(this._element);
				jQuery(this._element).one(ucUtil.TRANSITION_END, function (event) {
					return _this2._hideModal(event);
				}).emulateTransitionEnd(transitionDuration);
			} else {
				this._hideModal();
			}
		};

		_proto.dispose = function dispose() {
			jQuery.removeData(this._element, DATA_KEY);
			jQuery(window, document, this._element, this._backdrop).off(EVENT_KEY);
			this._config = null;
			this._element = null;
			this._dialog = null;
			this._backdrop = null;
			this._isShown = null;
			this._isBodyOverflowing = null;
			this._ignoreBackdropClick = null;
			this._scrollbarWidth = null;
		};

		_proto.handleUpdate = function handleUpdate() {
			this._adjustDialog();
		};

		_proto._getConfig = function _getConfig(config) {
			config = _objectSpread({}, Default, config);
			ucUtil.typeCheckConfig(NAME, config, DefaultType);
			return config;
		};

		_proto._showElement = function _showElement(relatedTarget) {
			var _this3 = this;

			var transition = jQuery(this._element).hasClass(ClassName.FADE);

			if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE)
				document.body.appendChild(this._element);

			this._element.style.display = 'block';

			this._element.removeAttribute('aria-hidden');

			this._element.scrollTop = 0;

			if (transition)
				ucUtil.reflow(this._element);

			jQuery(this._element).addClass(ClassName.SHOW);

			if (this._config.focus)
				this._enforceFocus();

			var shownEvent = jQuery.Event(Event.SHOWN, {
				relatedTarget: relatedTarget
			});

			var transitionComplete = function transitionComplete() {
				if (_this3._config.focus)
					_this3._element.focus();

				_this3._isTransitioning = false;
				jQuery(_this3._element).trigger(shownEvent);
			};

			if (transition) {
				var transitionDuration = ucUtil.getTransitionDurationFromElement(this._element);
				jQuery(this._dialog).one(ucUtil.TRANSITION_END, transitionComplete).emulateTransitionEnd(transitionDuration);
			} else {
				transitionComplete();
			}
		};

		_proto._enforceFocus = function _enforceFocus() {
			var _this4 = this;

			jQuery(document).off(Event.FOCUSIN).on(Event.FOCUSIN, function (event) {
				if (document !== event.target && _this4._element !== event.target && jQuery(_this4._element).has(event.target).length === 0) {
					_this4._element.focus();
				}
			});
		};

		_proto._setEscapeEvent = function _setEscapeEvent() {
			var _this5 = this;

			if (this._isShown && this._config.keyboard) {
				jQuery(this._element).on(Event.KEYDOWN_DISMISS, function (event) {
					if (event.which === ESCAPE_KEYCODE) {
						event.preventDefault();

						_this5.hide();
					}
				});
			} else if (!this._isShown) {
				jQuery(this._element).off(Event.KEYDOWN_DISMISS);
			}
		};

		_proto._setResizeEvent = function _setResizeEvent() {
			var _this6 = this;

			if (this._isShown) {
				jQuery(window).on(Event.RESIZE, function (event) {
					return _this6.handleUpdate(event);
				});
			} else {
				jQuery(window).off(Event.RESIZE);
			}
		};

		_proto._hideModal = function _hideModal() {
			var _this7 = this;

			this._element.style.display = 'none';
			this._element.setAttribute('aria-hidden', true);
			this._isTransitioning = false;

			this._showBackdrop(function () {
				jQuery(document.body).removeClass(ClassName.OPEN + _this7._getPlacement());

				_this7._resetAdjustments();

				_this7._resetScrollbar();

				jQuery(_this7._element).trigger(Event.HIDDEN);
			});
		};

		_proto._removeBackdrop = function _removeBackdrop() {
			if (this._backdrop) {
				jQuery(this._backdrop).remove();
				this._backdrop = null;
			}
		};

		_proto._showBackdrop = function _showBackdrop(callback) {
			var _this8 = this;

			var animate = jQuery(this._element).hasClass(ClassName.FADE) ? ClassName.FADE : '';

			if (this._isShown && this._config.backdrop) {
				this._backdrop = document.createElement('div');
				this._backdrop.className = ClassName.BACKDROP;

				if (animate) {
					this._backdrop.classList.add(animate);
				}

				jQuery(_this8._backdrop).prependTo(_this8._element).on(Event.CLICK_DISMISS, $.proxy(function (e) {
					if (e.target !== e.currentTarget)
						return;

					this._config.backdrop === 'static' ? _this8._element[0].focus.call(this._element[0]) : _this8.hide.call(this);
				}, this));

				jQuery(this._element).on(Event.CLICK_DISMISS, function (event) {
					if (_this8._ignoreBackdropClick) {
						_this8._ignoreBackdropClick = false;
						return;
					}

					if (event.target !== event.currentTarget)
						return;

					if (_this8._config.backdrop === 'static') {
						_this8._element.focus();
					} else {
						_this8.hide();
					}
				});

				if (animate)
					ucUtil.reflow(this._backdrop);

				jQuery(this._backdrop).addClass(ClassName.SHOW);

				if (!callback)
					return;

				if (!animate) {
					callback();
					return;
				}

				var backdropTransitionDuration = ucUtil.getTransitionDurationFromElement(this._backdrop);
				jQuery(this._backdrop).one(ucUtil.TRANSITION_END, callback).emulateTransitionEnd(backdropTransitionDuration);
			} else if (!this._isShown && this._backdrop) {
				jQuery(this._backdrop).removeClass(ClassName.SHOW);

				var callbackRemove = function callbackRemove() {
					_this8._removeBackdrop();

					if (callback)
						callback();
				};

				if (jQuery(this._element).hasClass(ClassName.FADE)) {
					var _backdropTransitionDuration = ucUtil.getTransitionDurationFromElement(this._backdrop);

					jQuery(this._backdrop).one(ucUtil.TRANSITION_END, callbackRemove).emulateTransitionEnd(_backdropTransitionDuration);
				} else {
					callbackRemove();
				}
			} else if (callback) {
				callback();
			}
		};

		_proto._adjustDialog = function _adjustDialog() {
			var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;

			if (!this._isBodyOverflowing && isModalOverflowing) {
				this._element.style.paddingLeft = this._scrollbarWidth + "px";
			}

			if (this._isBodyOverflowing && !isModalOverflowing) {
				this._element.style.paddingRight = this._scrollbarWidth + "px";
			}
		};

		_proto._resetAdjustments = function _resetAdjustments() {
			this._element.style.paddingLeft = '';
			this._element.style.paddingRight = '';
		};

		_proto._checkScrollbar = function _checkScrollbar() {
			var rect = document.body.getBoundingClientRect();
			this._isBodyOverflowing = rect.left + rect.right < window.innerWidth;
			this._scrollbarWidth = this._getScrollbarWidth();
		};

		_proto._setScrollbar = function _setScrollbar() {
			var _this9 = this;

			if (this._isBodyOverflowing) {
				var fixedContent = [].slice.call(document.querySelectorAll(Selector.FIXED_CONTENT));
				var stickyContent = [].slice.call(document.querySelectorAll(Selector.STICKY_CONTENT));

				jQuery(fixedContent).each(function (index, element) {
					var actualPadding = element.style.paddingRight;
					var calculatedPadding = jQuery(element).css('padding-right');
					jQuery(element).data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + _this9._scrollbarWidth + "px");
				});

				jQuery(stickyContent).each(function (index, element) {
					var actualMargin = element.style.marginRight;
					var calculatedMargin = jQuery(element).css('margin-right');
					jQuery(element).data('margin-right', actualMargin).css('margin-right', parseFloat(calculatedMargin) - _this9._scrollbarWidth + "px");
				});

				var actualPadding = document.body.style.paddingRight;
				var calculatedPadding = jQuery(document.body).css('padding-right');
				jQuery(document.body).data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + this._scrollbarWidth + "px");
			}
		};

		_proto._resetScrollbar = function _resetScrollbar() {
			var fixedContent = [].slice.call(document.querySelectorAll(Selector.FIXED_CONTENT));
			jQuery(fixedContent).each(function (index, element) {
				var padding = jQuery(element).data('padding-right');
				jQuery(element).removeData('padding-right');
				element.style.paddingRight = padding ? padding : '';
			});

			var elements = [].slice.call(document.querySelectorAll("" + Selector.STICKY_CONTENT));
			jQuery(elements).each(function (index, element) {
				var margin = jQuery(element).data('margin-right');

				if (typeof margin !== 'undefined') {
					jQuery(element).css('margin-right', margin).removeData('margin-right');
				}
			});

			var padding = jQuery(document.body).data('padding-right');
			jQuery(document.body).removeData('padding-right');
			document.body.style.paddingRight = padding ? padding : '';
		};

		_proto._getScrollbarWidth = function _getScrollbarWidth() {
			var scrollDiv = document.createElement('div');
			scrollDiv.className = ClassName.SCROLLBAR_MEASURER;
			document.body.appendChild(scrollDiv);
			var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
			document.body.removeChild(scrollDiv);
			return scrollbarWidth;
		};
		_proto._getPlacement = function _getPlacement() {
			var placement;

			if (jQuery(this._element).data('placement') == 'left') {
				placement = AttachmentMap.LEFT
			} else if (jQuery(this._element).data('placement') == 'right') {
				placement = AttachmentMap.RIGHT
			} else if (jQuery(this._element).data('placement') == 'bottom') {
				placement = AttachmentMap.BOTTOM
			} else if (jQuery(this._element).data('placement') == 'top') {
				placement = AttachmentMap.TOP
			}
			return placement;
		};
		ucSlipout._interface = function _interface(config, relatedTarget) {
			return this.each(function () {
				var data = jQuery(this).data(DATA_KEY);

				var _config = _objectSpread({}, Default, jQuery(this).data(), typeof config === 'object' && config ? config : {});
				
				if (!data) {
					data = new ucSlipout(this, _config);
					jQuery(this).data(DATA_KEY, data);
				}
				
				if (typeof config === 'string') {
					if (typeof data[config] === 'undefined') {
						throw new TypeError("No method named \"" + config + "\"");
					}
					
					data[config](relatedTarget);
				} else if (_config.show) {
					data.show(relatedTarget);
				}
			});
		};

		return ucSlipout;
	}();
	
	ucUtil.on(document, Selector.DATA_TOGGLE, Event.CLICK_DATA_API, function (event) {
		var _this10 = this;
		
		var target;
		var selector = ucUtil.getSelectorFromElement(this);

		if (selector)
			target = document.querySelector(selector);

		var config = jQuery(target).data(DATA_KEY) ? 'toggle' : _objectSpread({}, jQuery(target).data(), jQuery(this).data());

		if (this.tagName === 'A' || this.tagName === 'AREA')
			event.preventDefault();

		var $target = jQuery(target).one(Event.SHOW, function (showEvent) {
			
			if (showEvent.isDefaultPrevented())
				return;

			$target.one(Event.HIDDEN, function () {
				if (jQuery(_this10).is(':visible'))
					_this10.focus();
			});
		});
		
		ucSlipout._interface.call(jQuery(target), config, this);
	});
	
	$.fn[NAME] = ucSlipout._interface;
	$.fn[NAME].Constructor = ucSlipout;

	$.fn[NAME].noConflict = function() {
		$.fn[NAME] = JQUERY_NO_CONFLICT$5;
		return ucSlipout._interface;
	}; 
	
}));
/* UMD Module */
(function (global, factory) {

	typeof define === 'function' && define.amd ? define(['jquery'], factory) : //AMD
		typeof module === 'object' && module.exports ? module.exports = factory(require('jquery')) : //CommonJS
			global.ucTab = factory(global.$); //Window

}(this, function ($) {
	"use strict";

	var NAME = 'ucTab';
	var DATA_KEY = 'uc.tab';
	var EVENT_KEY = "." + DATA_KEY;
	
	var Event = {
		HIDE: "hide" + EVENT_KEY,
		HIDDEN: "hidden" + EVENT_KEY,
		SHOW: "show" + EVENT_KEY,
		SHOWN: "shown" + EVENT_KEY,
		CLICK_DATA_API: "click" + EVENT_KEY
	};

	var ClassName = {
		DROPDOWN_MENU: 'is-dropdown-menu',
		ACTIVE: 'is-active',
		DISABLED: 'is-disabled',
		FADE: 'is-fade',
		SHOW: 'is-show'
	};

	var Selector = {
		DROPDOWN: '.is-dropdown',
		NAV_LIST_GROUP: '.is-tab-nav',
		ACTIVE: '.is-active',
		ACTIVE_UL: '> li.is-active',
		DATA_TOGGLE: '[data-uc-click="tab"], [data-uc-click="pill"], [data-uc-click="list"]',
		DROPDOWN_TOGGLE: '.is-dropdown-toggle',
		DROPDOWN_ACTIVE_CHILD: '> .is-dropdown-menu .is-active'
	};
	
	var ucTab = function () {

		function ucTab(element) {
			this._element = element;
			this._elementParent = element.parentNode;
		}

		var _proto = ucTab.prototype;

		_proto.show = function show() {
			var _this = this;

			if (this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && jQuery(this._element).hasClass(ClassName.ACTIVE) || jQuery(this._element).hasClass(ClassName.DISABLED)) {
				return;
			}

			var target;
			var previous;
			var listElement = jQuery(this._element).closest(Selector.NAV_LIST_GROUP)[0];
			var selector = ucUtil.getSelectorFromElement(this._element);

			if (listElement) {
				var itemSelector = listElement.nodeName === 'UL' ? Selector.ACTIVE_UL : Selector.ACTIVE;
				previous = jQuery.makeArray(jQuery(listElement).find(itemSelector));
				previous = previous[previous.length - 1];
			}

			var hideEvent = jQuery.Event(Event.HIDE, {
				relatedTarget: this._element
			});
			var showEvent = jQuery.Event(Event.SHOW, {
				relatedTarget: previous
			});

			if (previous) {
				jQuery(previous).trigger(hideEvent);
			}

			jQuery(this._element).trigger(showEvent);

			if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
				return;
			}

			if (selector) {
				target = document.querySelector(selector);
			}

			this._activate(this._elementParent, listElement);

			var complete = function complete() {
				var hiddenEvent = jQuery.Event(Event.HIDDEN, {
					relatedTarget: _this._element
				});
				var shownEvent = jQuery.Event(Event.SHOWN, {
					relatedTarget: previous
				});
				jQuery(previous).trigger(hiddenEvent);
				jQuery(_this._element).trigger(shownEvent);
			};

			if (target) {
				this._activate(target, target.parentNode, complete);
			} else {
				complete();
			}
		};

		_proto.dispose = function dispose() {
			jQuery.removeData(this._element, DATA_KEY);
			this._element = null;
		};
		// Private

		_proto._activate = function _activate(element, container, callback) {
			var _this2 = this;

			var activeElements;

			if (container.nodeName === 'UL') {
				activeElements = jQuery(container).find(Selector.ACTIVE_UL);
			} else {
				activeElements = jQuery(container).children(Selector.ACTIVE);
			}


			var active = activeElements[0];
			var isTransitioning = callback && active && jQuery(active).hasClass(ClassName.FADE);

			var complete = function complete() {
				return _this2._transitionComplete(element, active, callback);
			};

			if (active && isTransitioning) {
				var transitionDuration = ucUtil.getTransitionDurationFromElement(active);
				jQuery(active).one(ucUtil.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
			} else {
				complete();
			}
		};

		_proto._transitionComplete = function _transitionComplete(element, active, callback) {

			if (active) {
				jQuery(active).removeClass(ClassName.SHOW + " " + ClassName.ACTIVE);
				var dropdownChild = jQuery(active.parentNode).find(Selector.DROPDOWN_ACTIVE_CHILD)[0];

				if (dropdownChild) {
					jQuery(dropdownChild).removeClass(ClassName.ACTIVE);
				}

				if (active.getAttribute('role') === 'tab') {
					active.setAttribute('aria-selected', false);
				}
			}

			jQuery(element).addClass(ClassName.ACTIVE);

			if (element.getAttribute('role') === 'tab') {
				element.setAttribute('aria-selected', true);
			}

			ucUtil.reflow(element);
			jQuery(element).addClass(ClassName.SHOW);

			if (element.parentNode && jQuery(element.parentNode).hasClass(ClassName.DROPDOWN_MENU)) {
				var dropdownElement = jQuery(element).closest(Selector.DROPDOWN)[0];

				if (dropdownElement) {
					var dropdownToggleList = [].slice.call(dropdownElement.querySelectorAll(Selector.DROPDOWN_TOGGLE));
					jQuery(dropdownToggleList).addClass(ClassName.ACTIVE);
				}

				element.setAttribute('aria-expanded', true);
			}

			if (callback) {
				callback();
			}
		};

		ucTab._interface = function _interface(config) {
			return this.each(function () {
				var $this = jQuery(this);
				var data = $this.data(DATA_KEY);

				if (!data) {
					data = new ucTab(this);
					$this.data(DATA_KEY, data);
				}

				if (typeof config === 'string') {
					if (typeof data[config] === 'undefined') {
						throw new TypeError("No method named \"" + config + "\"");
					}

					data[config]();
				}
			});
		};

		

		return ucTab;
	}();
	
	ucUtil.on(document, Selector.DATA_TOGGLE, Event.CLICK_DATA_API, function (event) {
		event.preventDefault();

		ucTab._interface.call(jQuery(this), 'show');
	});
		
	$.fn[NAME] = ucTab._interface;
	$.fn[NAME].Constructor = ucSlipout;

	$.fn[NAME].noConflict = function() {
		$.fn[NAME] = JQUERY_NO_CONFLICT$5;
		return ucTab._interface;
	}; 
}));