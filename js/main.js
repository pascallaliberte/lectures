$( document ).ready(function() {

  $(window).on("popstate", function(e) {
    enable_additional_readings();
    $( ".post-readings-additional").eq(0).remove();
  });

  enable_additional_readings();

});

enable_additional_readings = function () {
  $('#post-readings-additional-toggle-link').click(function(event) {
    event.preventDefault();
    $( '#post-readings-additional-toggle').remove();
    $( ".post-readings-additional").eq(0).slideDown();
    history.pushState({}, null);
  });
}
