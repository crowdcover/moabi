// main module
define(['jquery'], function ($) {
// define(function () {
  $.extend(moabi, {
    initMain: function(){
      $('header .dropdown').on('click', 'a.dropdown-button', this.headerDropdown);
      $('a.print-page').on('click', this.printPage);
      $('.show-opt-row').on('click', this.showRow);
      $('a[href^="#"]').on('click', this.textScroll);
    },

    headerDropdown: function(e){
      e.preventDefault();
      e.stopPropagation();
      $(this).parent('.dropdown').toggleClass('open');
    },

    printPage: function(e){
      e.preventDefault();
      e.stopPropagation();
      window.print();
    },

    showRow: function(e){
      e.stopPropagation();

      var $this = $(this);

      $this.toggleClass('active');
      $this.parent('tr').siblings('tr.' + $this.data('feature')).toggleClass('active');
    },

    textScroll: function(e){
      var target = $( $(this).attr('href') );
      if( target.length ) {
        $('html, body').animate({
            scrollTop: target.offset().top - 20
        }, 400);
      }
    }

  });
  return moabi;
});
