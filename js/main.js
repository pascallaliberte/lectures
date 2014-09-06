$( document ).ready(function() {
  $.get( "/additionnelles/2014-09-07-dimanche.html", function( data ) {
    $('.home .post-header').eq(0).each(function(){
      $(this).append('<div id="post-additional-readings-toggle"><a id="post-additional-readings-toggle-link" href="/additionnelles/2014-09-07-dimanche.html">Afficher les autres textes</a></div>');

      $('#post-additional-readings-toggle-link').click(function(event) {
        event.preventDefault();
        $( ".post-content" ).eq(0).prepend('<div class="post-additional-readings"></div>')
        $( ".post-additional-readings").eq(0).html( data ).slideDown();
        $( '#post-additional-readings-toggle').remove();
      });

    });
  });
});
