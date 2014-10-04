$( document ).ready(function() {

  $(window).on("popstate", function(e) {
    enable_main_readings();
    enable_additional_readings();
    $( ".post-readings-additional").eq(0).remove();
  });

});

enable_main_readings = function () {
  readings_url = "/{date}/";
  readings_date = $('.home').eq(0).data('post-date');
  readings_url = readings_url.replace(/\{date\}/, readings_date);

  $.get( readings_url, function( data ) {

    $('.home').eq(0).each(function(){
      $(this).html( data );
    });
  });
}

enable_additional_readings = function () {
  readings_url = "/additionnelles/{date}.html";
  readings_date = $('.home').eq(0).data('post-date');
  readings_url = readings_url.replace(/\{date\}/, readings_date);

  $.get( readings_url, function( data ) {

    $('.home .post-header').eq(0).each(function(){
      $(this).append('<div id="post-readings-additional-toggle"><a id="post-readings-additional-toggle-link" href="' + readings_url + '">Afficher les autres textes</a></div>');

      $('#post-readings-additional-toggle-link').click(function(event) {
        event.preventDefault();
        $( ".post-content" ).eq(0).prepend('<div class="post-readings post-readings-additional"></div>')
        $( '#post-readings-additional-toggle').remove();
        $( ".post-readings-additional").eq(0).html( data ).slideDown();
        history.pushState({}, null);
      });

    });
  });
}
