
(function($) {

  Drupal.behaviors.facetbrowser = {
    attach: function(context, settings) {
      Drupal.FoldFacetGroup();

      // Check for click in checkbox, and execute search
      $(Drupal.settings.dingFacetBrowser.mainElement + ' .form-type-checkbox input').change(function(e) {
        $('body').prepend('<div class="facetbrowser_overlay"><div class="spinner"></div></div>');
        window.location = $(e.target).parent().find('a').attr('href');
      });

      $("#ding-facetbrowser-form").delegate("div[data-expand='more'] span", "click", function() {
        var facetGroup = $(this).parents('fieldset');
        var divExpand = $(this).parent();

        facetGroup.find('.form-type-checkbox:hidden').each(function(count, facetElement) {
          if ( count < Drupal.settings.dingFacetBrowser.showCount ) {
            $(facetElement).slideDown('fast', function() {});
          }
        });

        // add 'less' element, if there isn't one already
        if ( facetGroup.find("div[data-expand='less']").size() === 0 ) {
          divExpand.after('<div class="expand" data-expand="less"><span class="icon icon-left icon-blue-minus">-</span><span>' + Drupal.t('label_facet_show_less') + '</span></div>');
        }

        // remove 'more' element, if we're at the end
        if ( ( facetGroup.find('.form-type-checkbox:visible').size() >= facetGroup.attr('data-count') ) && ( divExpand.attr('data-expand') == 'more' ) ) {
          divExpand.remove();
        }

      });

      $("#ding-facetbrowser-form").delegate("div[data-expand='less'] span", "click", function() {
        var facetGroup = $(this).parents('fieldset');
        var divExpand = $(this).parent();

        facetGroup.find('.form-type-checkbox:visible').each(function(count, facetElement) {
          if ( count >= Drupal.settings.dingFacetBrowser.showCount ) {
            $(facetElement).slideUp('fast', function() {});
          }
        });

        // we're at the start, so add 'more' element, and remove 'less' element
        divExpand.fadeOut().remove();
        if ( !(facetGroup.find("div[data-expand='more']").length) ) {
          facetGroup.append('<div class="expand" data-expand="more"><span class="icon icon-left icon-blue-plus">+</span><span>' + Drupal.t('label_facet_show_more') + '</span></div>');
        }

      });

    }
  };


  /**
  * Fold facet groups to show only n per group.
  */
  Drupal.FoldFacetGroup = function() {

    $(Drupal.settings.dingFacetBrowser.mainElement + ' fieldset.form-wrapper').each(function() {
      // hide surplus facets, and add 'show more' element
      var facetGroup = $(this);
      if (facetGroup.find('.form-type-checkbox').size() > Drupal.settings.dingFacetBrowser.showCount) {
        facetGroup.find('.form-type-checkbox').each(function(counter, facetElement) {
          if ( counter >= Drupal.settings.dingFacetBrowser.showCount ) {
            $(facetElement).hide();
          }
        });
        if ( !facetGroup.find("div[data-expand='more']").length ) {
          facetGroup.append('<div class="expand" data-expand="more"><span class="icon icon-left icon-blue-plus">+</span><span>' + Drupal.t('label_facet_show_more') + '</span></div>');
        }
      }
    });

  };


})(jQuery);


