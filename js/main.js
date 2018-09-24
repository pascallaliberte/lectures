import jQuery from 'jquery'
import 'jquery.smooth-scroll'

(function($){
  
  jQuery.extend( jQuery.easing, // from http://gsgd.co.uk/sandbox/jquery/easing/
  {
    easeOutQuart: function (x, t, b, c, d) {
      return -c * ((t=t/d-1)*t*t*t - 1) + b;
    }
  });

  var enable_additional_readings = function () {
    $('#post-readings-additional-toggle-link').click(function(event) {
      event.preventDefault();
      $( '#post-readings-additional-toggle').remove();
      $( ".post-readings-additional").eq(0).slideDown();
      history.pushState({}, null);
    });
  }

  var is_touch_device = function() {
    return 'ontouchstart' in window // works on most browsers
        || 'onmsgesturechange' in window; // works on ie10
  };

  var update_page_properties = function(){
    var scrollPos = $(window).scrollTop();
    var topGutterHeight = parseInt($("body").eq(0).css("padding-top"))

    if (0 >= scrollPos) {
      $("body").eq(0).addClass('is-top');
      $("body").eq(0).removeClass('is-not-top');
    } else {
      $("body").eq(0).removeClass('is-top');
      $("body").eq(0).addClass('is-not-top');
    }

    if (window.innerHeight > topGutterHeight * 1.4) {
      $("body").eq(0).addClass('is-fits-blog-nav-simple');
    } else {
      $("body").eq(0).removeClass('is-fits-blog-nav-simple');
    }

    if (window.innerHeight > topGutterHeight * 1.75) {
      $("body").eq(0).addClass('is-fits-blog-nav');
    } else {
      $("body").eq(0).removeClass('is-fits-blog-nav');
    }

    if (window.innerHeight > topGutterHeight * 2) {
      $("body").eq(0).addClass('is-fits-blog-nav-large');
    } else {
      $("body").eq(0).removeClass('is-fits-blog-nav-large');
    }

    if (is_touch_device()) {
      $("body").eq(0).addClass('is-touch');
    } else {
      $("body").eq(0).addClass('is-not-touch');
    }

    setTimeout(function(){
      var scrollPos = $(window).scrollTop();

      if (scrollPos < (topGutterHeight - 31)) {
        $("body").eq(0).addClass('is-top-gutter-shown');
        $("body").eq(0).removeClass('is-not-top-gutter-shown');
      } else {
        $("body").eq(0).removeClass('is-top-gutter-shown');
        $("body").eq(0).addClass('is-not-top-gutter-shown');
      }
    }, 500);
  }
  
  var enable_sroll_trick = function() {
    $("body").eq(0).addClass('js');

    $(".to-top").smoothScroll({
      easing: 'easeOutQuart',
      speed: 600,
      preventDefault: true
    });

    var topGutterHeight = parseInt($("body").eq(0).css("padding-top"))

    $(".site").eq(0).css("min-height",$( window ).height());

    if (0 == $(window).scrollTop()) {
      $(window).scrollTop(topGutterHeight);
    }

    $(window).scroll(update_page_properties);

    $(window).resize(function(){
      $(".site").eq(0).css("min-height",$( window ).height());
      update_page_properties()
    });
  }
  
  $( document ).ready(function() {

    $(window).on("popstate", function(e) {
      enable_additional_readings();
      $( ".post-readings-additional").eq(0).remove();
    });

    enable_additional_readings();
    enable_sroll_trick();
    
  });
})(jQuery);