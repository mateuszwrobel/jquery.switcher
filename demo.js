$(function () {
	$('.horizontal input.switch').switcher({
		customClass: 'netkata-switcher',
		toggledOn: function() {
			$(this).parent().parent().find('.toggleTarget').removeAttr('disabled');
		},
		toggledOff: function() {
			$(this).parent().parent().find('.toggleTarget').attr('disabled', 'disabled');
		}
	});

	$('.vertical .switch').switcher({
		customClass: 'netkata-switcher',
		position: 'vertical',
		swapOnOff: true,
		toggledOn: function() {
			$(this).parent().parent().find('.toggleTarget').removeAttr('disabled');
		},
		toggledOff: function() {
			$(this).parent().parent().find('.toggleTarget').attr('disabled', 'disabled');
		}
	});

	$('.toggle-switch').click( function ( event ) {
		event.preventDefault();
		$(this).parent().parent().find('input.switch').switcher('toggle');
	} );

	$('.toggle-on-switch').click( function ( event ) {
		event.preventDefault();
		$(this).parent().parent().find('input.switch').switcher('toggleOn');
	} );

	$('.toggle-off-switch').click( function ( event ) {
		event.preventDefault();
		$(this).parent().parent().find('input.switch').switcher('toggleOff');
	} );
});