<?php
/**
 * @file
 * CTools content type file for the ding_facetbrowser module.
 */

$plugin = array(
  'title' => t('Ding Facetbrowser', array(), array('context' => 'ding_facetbrowser')),
  'description' => t('Ding facetbrowser description', array(), array('context' => 'ding_facetbrowser')),
  'single' => TRUE,
  'content_types' => array('ding_facetbrowser'),
  'render callback' => 'ding_facetbrowser_content_type_render',
  'category' => t('Ting'),
  'render last' => TRUE, # Force the facetbrowser to be generated after the ting_search
);

/**
 * Callback function for the ctools content_type
 */
function ding_facetbrowser_content_type_render($subtype, $conf, $panel_args, $context) {
  $block_content          = FALSE;
  $content_in_facet       = FALSE;
  $executed_search_module = FALSE;
  $block                  = new stdClass();

  $block->module = 'ding_facetbrowser';
  $block->delta  = 'ding_facetbrowser';
  $block->title = t('Ding Facetbrowser', array(), array('context' => 'ding_facetbrowser block title'));

  $show_count = variable_get('ding_facetbrowser_number_shown', 5);
  $show_count_consecutive = variable_get('ding_facetbrowser_consecutive_number_shown', 10);

  drupal_add_css(drupal_get_path('module', 'ding_facetbrowser') . '/css/facetbrowser.css');
  drupal_add_js(drupal_get_path('module', 'ding_facetbrowser') . '/js/facetbrowser.js');
  drupal_add_js(
    array(
      'dingFacetBrowser' => array(
        'mainElement' => '.pane-ding-facetbrowser',
        'showCount' => $show_count,
        'showCountConsecutive' => $show_count_consecutive
      )
    ),
    'setting'
  );

  $by_ajax = variable_get('ding_facetbrowser_by_ajax', FALSE);

  if($by_ajax){
    $content = ding_facetbrowser_facetbrowser_placeholder();
    $block->content = drupal_render($content);
  }
  else{
    // Invoke ding_facetbrowser() from executed search module
    $executed_search = menu_get_item();
    if (!empty($executed_search['page_arguments'])) {
      list($executed_search_module, ) = $executed_search['page_arguments'];
    }
    if (is_string($executed_search_module)) {
      $results = module_invoke($executed_search_module, 'ding_facetbrowser');
      if (is_object($results)) {
        foreach ($results->facets as $result) {
          if (count($result->terms) == TRUE) {
            $content_in_facet = TRUE;
            break;
          }
        }
        if ( $content_in_facet === TRUE || $results->show_empty == TRUE ) {
          $block_content = theme('facetbrowser', array($results->facets, (!empty($results->searchkey) ? $results->searchkey : NULL)));
        }
      }
      $block->content = $block_content;

    }
  }
  return $block;
}



/**
 * Returns an edit form for settings
 */
function ding_facetbrowser_ding_facetbrowser_content_type_edit_form($form, &$form_state) {
  return $form;
}
