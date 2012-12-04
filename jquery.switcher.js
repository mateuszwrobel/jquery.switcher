/*!
 * jQuery switcher plugin
 * Original author: @okotetto (Mateusz Wróbel - wrobel.mateusz@gmail.com)
 * Licensed under the MIT license
 */

;(function ( $, window, document, undefined ) {

	/**
	 *	OPTIONS:
	 *	animationTime (string) animation time in miliseconds
	 *	customClass (string) name for additional class for switcher
	 *	cssPrefix (string) prefix for css classes for switcher
	 *	dragable (boolean)
	 *	position: (string) possible values: vertical, horizontal - for setting handler position
	 *	onlyLeftClick: (boolean) allow drag/click only for left mouse button
	 *	useAnimation: (boolean)
	 *	toggled (function) callback function is called when toggle event is triggered
	 *	toggledOn: (function) callback function is called when toggleOn event is triggered
	 *	toggledOff: (function) callback function is called when toggleOff event is triggered
	 */
	
	// Create the defaults once
	var pluginName = "switcher";
	var defaults = {
		animationTime: 100,
		customClass: '',
		cssPrefix: "ui-",
		dragable: true,
		position: 'horizontal',
		onlyLeftClick: true,
		useAnimation: true,
		toggled: function () { },
		toggledOn: function () { },
		toggledOff: function () { }
	};

	// The actual plugin constructor
	function Switcher( element, options ) {
		this.element = element;

		this.options = $.extend( {}, defaults, options );
	
		this.init();
	}

	Switcher.prototype.init = function () {
		if ( this.element.type !== 'checkbox'  ) {
			throw( 'Chosen element is not checkbox. This plugin can be assign only to checkboxes' );
		}

		var checkbox = this.element;
		var handler = document.createElement( 'span' );
		var options = this.options;
		var switcher = document.createElement( 'a' );
		var switchOnBackground = document.createElement( 'span' );

		// flags
		var isHorizontal = ( options.position === 'horizontal' ) ? true : false;
		var isVertical = ( options.position === 'vertical' ) ? true : false;

		if ( !isHorizontal && !isVertical ) {
			this.options.position = 'horizontal';
			isHorizontal = true;
		}

		// function vars
		var setClassForElement = function ( element, className ) {
			element.className = options.cssPrefix + className ;
		};

		var allowOnlyLeftClick = function ( event ) {
			if ( options.onlyLeftClick ) {
				if ( event.button !== 0  && !( $.browser.msie && event.button === 1 ) ) {
					return true;
				}
			}
			return false;
		};

		// set classes for new elements
		setClassForElement( switcher, 'switcher' );
		if ( options.customClass.length > 0 ) {
			$( switcher ).addClass( options.customClass );
		}
		setClassForElement( switchOnBackground, 'switcher-background-on' );
		setClassForElement( handler, 'switcher-handler' );

		// append to DOM new switcher
		// fire update event to set switch in right place
		$( checkbox )
			.after( $( switcher )
				.append( switchOnBackground )
				.append( handler )
			)
			.trigger( 'update', true )
			.hide();

		var switcherDimension = ( isHorizontal ) ? parseInt( $( switcher ).width(), 10 ) : parseInt( $( switcher ).height(), 10 );
		var handlerDimension = ( isHorizontal ) ? parseInt( $( handler ).width(), 10 ) : parseInt( $( handler ).height(), 10 );
		var attrToUse = ( isHorizontal ) ? 'left' : 'top';

		// declare events for checkbox
		checkbox.events = {
			toggle: function () {
				if ( $( checkbox ).is( ':checked' ) ) {
					$( checkbox ).removeAttr( 'checked' );
					options.toggledOff.call( checkbox );
				} else {
					$( checkbox ).attr( 'checked', 'checked' );
					options.toggledOn.call( checkbox );
				}
				$( checkbox ).trigger( 'update' );
				options.toggled.call( checkbox );
			},
			toggleOn: function () {
				if ( !$( checkbox ).is(':checked') ) {
					$( checkbox ).attr( 'checked', 'checked' );
					options.toggledOn.call( checkbox );
					options.toggled.call( checkbox );
				}
				$( checkbox ).trigger( 'update' );
			},
			toggleOff: function () {
				if ( $( checkbox ).is(':checked') ) {
					$( checkbox ).removeAttr( 'checked' );
					options.toggledOff.call( checkbox );
					options.toggled.call( checkbox );
				}
				$( checkbox ).trigger( 'update' );
			},
			update: function ( o, disableAnimation ) {
				var animateObject = {};

				if ( $( checkbox ).is( ':checked' ) ) {
					animateObject[ attrToUse ] = switcherDimension - handlerDimension + 'px';

					// $( switchOnBackground ).show( options.useAnimation && !disableAnimation ? options.animationTime : 0 );
					$( handler ).animate( animateObject, options.useAnimation && !disableAnimation ? options.animationTime : 0);
				} else {
					animateObject[ attrToUse ] = '0px';

					// $( switchOnBackground ).hide( options.useAnimation && !disableAnimation ? options.animationTime : 0);
					$( handler ).animate( animateObject, options.useAnimation && !disableAnimation ? options.animationTime : 0 );
				}
			}
		};

		$( checkbox ).on( checkbox.events );

		// declare events for switcher
		if ( !options.dragable ) {
			switcher.events = {
				click: function ( event ) {
					event.preventDefault();

					// check if only left click is allowed
					// if yes and that was not left click return false
					if ( allowOnlyLeftClick( event ) ) {
						return false;
					}

					$( checkbox ).trigger( 'toggle' );
				}
			};

			$( switcher ).on( switcher.events );
		} else {
			// helper var for dragging

			// key offsets
			var minOffset = 0;
			var maxOffset = parseInt( switcherDimension - handlerDimension, 10 );
			var centerOffset = parseInt( switcherDimension / 2 - handlerDimension / 2, 10 );

			// position offsets for dragging
			var startOffset = 0;
			var handlerPosition = 0;
			var newPosition = 0;

			// handler is dragged
			var isDragging = false;

			// on start dragging
			var startDrag = function ( event ) {
				// check if only left click is allowed
				// if yes and that was not left click return false
				if ( allowOnlyLeftClick( event ) ) {
					return false;
				}

				$( document ).on( {
					mousemove: switcher.events.mousemove,
					mouseup: switcher.events.mouseup,
					touchmove: switcher.events.touchmove,
					touchend: switcher.events.touchend
				} );

				if ( isHorizontal )
					startOffset = event.pageX;
				else
					startOffset = event.pageY;

				handlerPosition = parseInt( $( handler ).css( attrToUse ), 10 );
			};

			// on dragging handler
			var dragging = function ( event ) {
				console.log('dragging');
				var currentOffset = 0;

				isDragging = true;

				if ( isHorizontal )
					currentOffset = event.pageX;
				else
					currentOffset = event.pageY;

				newPosition = handlerPosition + currentOffset - startOffset;

				if ( newPosition >= minOffset && newPosition <= maxOffset) {
					var positionObject = {};
					positionObject[ attrToUse ] = newPosition + 'px';
					$( handler ).css( positionObject );
				}
			};

			// on end of dragging
			var endDrag = function ( event ) {
				console.log('endDrag');
				$( document ).off( 'mouseup mousemove touchmove touchend' );
				if ( isDragging ) {
					if ( newPosition <= centerOffset ) {
						$( checkbox ).trigger ( 'toggleOff' );
					} else {
						$( checkbox ).trigger ( 'toggleOn' );
					}
				} else {
					$( checkbox ).trigger ( 'toggle' );
				}

				isDragging = false;
			};

			// declare switcher events
			switcher.events = {
				mousedown: startDrag,
				mousemove: dragging,
				mouseup: endDrag,
				mouseleave: endDrag,
				touchstart: function ( event ) {
					event.preventDefault();

					$( document ).off( 'mousedown' );
					startDrag( event.touches[ 0 ] );
				},
				touchmove: function () {
					event.preventDefault();

					$( document ).off( 'mousemove' );
					dragging( event.touches[ 0 ] );
				},
				touchend: function () {
					event.preventDefault();

					$( document ).off( 'mouseup' );
					endDrag( event.touches[ 0 ] );
				}
			};

			// bind events for switcher
			$( switcher ).on( {
				mousedown: switcher.events.mousedown,
				touchstart: switcher.events.touchstart
			} );
		}
	};

	Switcher.prototype.toggle = function () {
		$( this ).trigger( 'toggle' );
	};

	Switcher.prototype.toggleOn = function () {
		$( this ).trigger( 'toggleOn' );
	};

	Switcher.prototype.toggleOff = function () {
		$( this ).trigger( 'toggleOff' );
	};

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function ( options ) {
		var nameForData = "plugin_" + pluginName;

		var method = ( typeof options === 'string' ) ? options : '';

		return this.each( function () {
			var switcherInstantion = $.data( this, nameForData );

			if ( !switcherInstantion ) {
				$.data( this, nameForData, (function ( element ) {
						return new Switcher( element, options );
					})( this )
				);
			} else {
				if ( switcherInstantion[ method ] ) {
					switcherInstantion[ method ].call( this );
				} else {
					throw( 'Method ' + method + ' does not exist' );
				}
			}
		} );
	};

})( jQuery, window, document );