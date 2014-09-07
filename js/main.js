$( document ).ready(function() {

  $(window).on("popstate", function(e) {
    enable_additional_readings();
    $( ".post-additional-readings").eq(0).remove();
  });

});

enable_additional_readings = function () {
  readings_url = "/additionnelles/2014-09-07-dimanche.html";
  $.get( readings_url, function( data ) {

    $('.home .post-header').eq(0).each(function(){
      $(this).append('<div id="post-additional-readings-toggle"><a id="post-additional-readings-toggle-link" href="' + readings_url + '">Afficher les autres textes</a></div>');

      $('#post-additional-readings-toggle-link').click(function(event) {
        event.preventDefault();
        $( ".post-content" ).eq(0).prepend('<div class="post-additional-readings"></div>')
        $( '#post-additional-readings-toggle').remove();
        $( ".post-additional-readings").eq(0).html( data ).slideDown();
        history.pushState({}, null, '#additionnelles');
      });

    });
  });
}
