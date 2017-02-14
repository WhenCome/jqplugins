/**
 * A jquery plugin which make a toast in your html page just like android toast does.
 *
 * @author Eric Tao
 * @version 0.1-beta
 * @usage:
 *     // show message in your web page for "timeInSeconds" seconds.
 *     $.Toast.show(message, timeInSeconds);
 */
;(function($) {
    timer : 0,
    // Toast Tip Plugins
    $.extend({Toast:{
        show : function(message, timeInSeconds){
            if (timeInSeconds <= 0) {
                timeInSeconds = 3;
            }
            var containerId = 'JM_TOAST_BOX';
            if ($('#'+containerId).size() == 0) {
                var html = '<div id="'+containerId+'" style="position: absolute; min-width: 250px; text-align: center; border-radius: 5px !important; background-color: #000000; color: #ffffff; padding: 5px; line-height: 30px; display: none; filter:alpha(opacity=50); opacity: 0.5; font-size: 120%; font-weight: bold;"></div>';
                $('body').append(html);
            }
            var winHeight = $(window).height();
            var winWidth = $(window).width();
            var boxWidth = $('#'+containerId).width();
            var boxHeight = $('#'+containerId).height();
            var left = (winWidth - boxWidth) / 2;
            var top = (winHeight - boxHeight) / 2;
            top = $(document).scrollTop() + top;
            $('#'+containerId).html(message);
            // clear the timer
            clearTimeout($.Toast.timer);
            $('#'+containerId).css({
                'top' : top+'px',
                'left' : left+'px'
            }).fadeIn();
            $.Toast.timer = setTimeout(function(){
                $('#'+containerId).fadeOut();
            }, timeInSeconds * 1000);
        }
    }});
})(jQuery);
