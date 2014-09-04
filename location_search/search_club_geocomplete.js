(function($) {
  $(document).ready(function() {
    $("#edit-location").geocomplete({ details: "#search-club-bylocation-form" });
    $("#edit-location").placeholder();
  });
})(jQuery);
