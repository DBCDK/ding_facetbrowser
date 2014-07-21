(function($) {

  Drupal.tingOpenformatSetFacets = function(facets) {
    if(facets.error) {
      $('.ding_facetbrowser_facets_placeholder').prepend(facets.error);
    }
    else {
      $('.ding_facetbrowser_facets_placeholder').html(facets.markup);
      Drupal.facetBrowserInit();

      var facetsObj = {
        timestamp: Date.now(),
        markup: facets.markup
      };
      Drupal.tingOpenformatSetSessionStorage(Drupal.settings.ting_openformat.search_key, facetsObj);
    }
  };

  /**
   * Used when setting facets with data from sessionStorage to avoid
   * unnecessary update of the sessionStorage
   */
  Drupal.tingOpenformatGetFacetsFromSessionStorage = function(markup) {
    $('.ding_facetbrowser_facets_placeholder').html(markup);
    Drupal.facetBrowserInit();
  };

  /**
   * Asks for facets based on the current search result. If the browser
   * supports sessionStorage it will check for saved facets otherwise facets
   * will be retrieved by AJAX.
   */
  Drupal.tingOpenformatGetFacets = function() {
    if(Modernizr.sessionstorage && !Drupal.settings.ting_openformat.isAdmin) {
      Drupal.tingOpenformatCheckSessionStorage();
    }
    else {
      Drupal.tingOpenformatGetFacetsByAjax();
    }
  };

  /**
   * Returns facets stored in the sessionStorage. If none is found facets will
   * be retrieved by AJAX.
   *
   * If the facets currently stored in the sessionStorage has an age of
   * 24 hours or more, the stored facets will get deleted and new ones will
   * be retrieved by AJAX.
   */
  Drupal.tingOpenformatCheckSessionStorage = function() {
    var facetsObj = sessionStorage.getItem(Drupal.settings.ting_openformat.search_key);

    facetsObj = JSON.parse(facetsObj);

    if(!facetsObj || !facetsObj.markup || !facetsObj.timestamp) {
      Drupal.tingOpenformatGetFacetsByAjax();
    }
    else {
      var now = Date.now();
      if(now - facetsObj.timestamp >= 86400000) {
        Drupal.tingOpenformatGetFacetsByAjax();
      }
      else {
        Drupal.tingOpenformatGetFacetsFromSessionStorage(facetsObj.markup);
      }
    }
  };

  /**
   * Stores the given value object in the sessionStorage with the key
   * parameter as key.
   * If the browser doesn't support sessionStorage the operation will be
   * aborted silently.
   *
   * @param value mixed
   * @param key string
   * @param retry bool idicating if the attempt so store is a retry after sessionStorage have been cleared
   */
  Drupal.tingOpenformatSetSessionStorage = function(key, value, retry) {
    if(!Modernizr.sessionstorage) {
      console.log("sessionStorage is not supported by this browser");
      return;
    }

    try{
      sessionStorage.setItem(key, JSON.stringify(value));
      Drupal.tingOpenformatStoreSearchKey(key);
    } catch(e){
      if(!retry){
        Drupal.tingOpenformatClearSessionStorageSearches();
        Drupal.tingOpenformatSetSessionStorage(key, value, true);
      }
    }
  };

  /**
   * Stores the key associated witn the current search ion the searches array
   * that keeps track of the searces stored in the sessionStorage.
   *
   * @param key string
   * @return {boolean}
   */
  Drupal.tingOpenformatStoreSearchKey = function(key){
    var searches = sessionStorage.getItem('searches');
    searches = JSON.parse(searches);
    
    if(!searches){
      searches = [];
    }
    
    if(searches.indexOf(key) == -1){
      searches.push(key);
      sessionStorage.setItem('searches', JSON.stringify(searches));
    }
  };

  /**
   * Clears out the seartches stored in sessionStorage.
   *
   * @return {boolean}
   */
  Drupal.tingOpenformatClearSessionStorageSearches = function(){
    var searches = sessionStorage.getItem('searches');
    searches = JSON.parse(searches);
    
    if(!searches){
      searches = [];
    }

    searches.forEach(function(value){
      sessionStorage.removeItem(value);
    });

    sessionStorage.setItem('searches', JSON.stringify([]));
  };

  /**
   * Retrieves the facets from the server by AJAX.
   */
  Drupal.tingOpenformatGetFacetsByAjax = function() {
    $.ajax({
      url: Drupal.settings.basePath + 'ting_openformat/ajax/facets',
      type: 'POST',
      dataType: 'json',
      success: Drupal.tingOpenformatSetFacets
    });
  };

  Drupal.behaviors.tingOpenformatLoad = {
    attach: function(context) { 
      var element = $('.ding_facetbrowser_facets_placeholder');
      if(element.length == 0) {
        Drupal.facetBrowserInit();
      }
      else {
        element = $('#ding-facetbrowser-form');
        if(element.length < 1) {
          $('.ding_facetbrowser_facets_placeholder', context).ready(function() {
            var div = $('.ding_facetbrowser_facets_placeholder');
            div.html('<div class="ajax-progress ajax-progress-throbber"><div class="throbber"></div></div>');
            Drupal.tingOpenformatGetFacets();
          });
        }
      }
    }
  };

  Drupal.facetBrowserInit = function() {
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
        if(count < Drupal.settings.dingFacetBrowser.showCountConsecutive) {
          $(facetElement).slideDown('fast', function() {
          });
        }
      });

      // add 'less' element, if there isn't one already
      if(facetGroup.find("div[data-expand='less']").size() === 0) {
        divExpand.after('<div class="expand" data-expand="less"><span class="icon icon-left icon-blue-minus">-</span><span>' + Drupal.t('label_facet_show_less') + '</span></div>');
      }

      // remove 'more' element, if we're at the end
      if(( facetGroup.find('.form-type-checkbox:visible').size() >= facetGroup.attr('data-count') ) && ( divExpand.attr('data-expand') == 'more' )) {
        divExpand.remove();
      }

    });

    $("#ding-facetbrowser-form").delegate("div[data-expand='less'] span", "click", function() {
      var facetGroup = $(this).parents('fieldset');
      var divExpand = $(this).parent();

      facetGroup.find('.form-type-checkbox:visible').each(function(count, facetElement) {
        if(count >= Drupal.settings.dingFacetBrowser.showCount) {
          $(facetElement).slideUp('fast', function() {
          });
        }
      });

      // we're at the start, so add 'more' element, and remove 'less' element
      divExpand.fadeOut().remove();
      if(!(facetGroup.find("div[data-expand='more']").length)) {
        facetGroup.append('<div class="expand" data-expand="more"><span class="icon icon-left icon-blue-plus">+</span><span>' + Drupal.t('label_facet_show_more') + '</span></div>');
      }

    });
  };

  /**
   * Fold facet groups to show only n per group.
   */
  Drupal.FoldFacetGroup = function() {
    $(Drupal.settings.dingFacetBrowser.mainElement + ' fieldset.form-wrapper').each(function() {
      // hide surplus facets, and add 'show more' element
      var facetGroup = $(this);
      if(facetGroup.find('.form-type-checkbox').size() > Drupal.settings.dingFacetBrowser.showCount) {
        facetGroup.find('.form-type-checkbox').each(function(counter, facetElement) {
          if(counter >= Drupal.settings.dingFacetBrowser.showCount) {
            $(facetElement).hide();
          }
        });
        if(!facetGroup.find("div[data-expand='more']").length) {
          facetGroup.append('<div class="expand" data-expand="more"><span class="icon icon-left icon-blue-plus">+</span><span>' + Drupal.t('label_facet_show_more') + '</span></div>');
        }
      }
    });

  };

})(jQuery);


