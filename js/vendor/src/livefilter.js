/*! ========================================================================
 * Live Filter: livefilter.js v2.0.0
 * ========================================================================
 * Copyright 2015, Salvatore Di Salvo (disalvo-infographiste[dot].be)
 * ======================================================================== */

(function ($) {
    'use strict';

    // FILTER PUBLIC CLASS DEFINITION
    // ====================================

    var Filter = function (element, options) {
        this.$element  = $(element)
        this.options   = $.extend({}, this.defaults(), options)
        this.structure   = $.extend({}, this.parts())
        this.keywords   = null
        this.init()
    }

    Filter.VERSION  = '2.1.0'

    Filter.DEFAULTS = {
        clearbtn : false,
        textinfo : true,
        autocomplete : false,   // Allow auto-completion
        hint: "placeholder",    // "placeholder", "select", false
        arrowKeys: false,       // Allow the use of <up> and <down> keys to iterate
        matches: false,         // Show the number the number of elements in the list which match the filter
        caseSensitive: false,
        minLength: 1,
        wrapInput: true
    }

    Filter.prototype.parts = function() {
        return {
            $input      : $('.live-search', this.$element),
            $filter     : $('.list-to-filter',this.$element),
            $clear      : $('.filter-clear', this.$element),
            $no_results : $('.no-search-results', this.$element),
            $info        : $('.filter-info', this.$element),
            $val        : $('.filter-val', this.$element),
            $items      : $('.filter-item', this.$element),
            $matches    : $('.matches', this.$element)
        }
    }

    Filter.prototype.defaults = function() {
        return {
            clearbtn        : this.$element.attr('data-clear') || Filter.DEFAULTS.clearbtn,
            textinfo        : this.$element.attr('data-textinfo') || Filter.DEFAULTS.textinfo,
            autocomplete    : this.$element.attr('data-autocomplete') || Filter.DEFAULTS.autocomplete,
            hint            : this.$element.attr('data-hint') || Filter.DEFAULTS.hint,
            arrowKeys       : this.$element.attr('data-keys') || Filter.DEFAULTS.arrowKeys,
            matches         : this.$element.attr('data-matches') || Filter.DEFAULTS.arrowKeys,
            caseSensitive   : Filter.DEFAULTS.caseSensitive,
            minLength       : Filter.DEFAULTS.minLength,
            wrapInput       : Filter.DEFAULTS.wrapInput
        }
    }

    Filter.prototype.getKeywords = function() {
        var keywords = [];
        this.structure.$items.each(function(i) {
            if( !$(this).hasClass('disabled') )
                keywords = keywords.concat($(this).attr('data-filter').split('|'));
        });
        return keywords;
    }

    Filter.prototype.init = function() {
        var $filter = this;

        if ($filter.options.autocomplete) {
            $filter.initAC();
        }

        if ($filter.options.clearbtn) {
            $filter.structure.$clear.click(function (e) {
                e.preventDefault();
                $filter.clear()
            });
        }

        $filter.structure.$input.on('keyup', function() {
            var val = $(this).val().toLowerCase();

            $filter.structure.$val.text(val);

            if ($filter.options.clearbtn)
                $filter.structure.$clear.toggleClass('hide', !val).prev('span').toggle(!val);

            var resultsCount = $filter.searchAndFilter(val);

            if ( resultsCount == 0 && val.length != 0) {
                $filter.structure.$no_results.show();
            } else {
                $filter.structure.$no_results.hide();
            }

            if ($filter.options.textinfo) {
                if( (val.length == 0 || val == '') || resultsCount == 0) {
                    $filter.structure.$info.hide();
                } else {
                    $filter.structure.$info.show();
                }
            }
        });

        $filter.structure.$input
            .val('')
            .trigger('input')
            .trigger('keyup');

        if ($filter.structure.$clear && $filter.options.clearbtn) {
            $filter.structure.$clear.addClass('hide').prev('span').show(); // Hide clear button
        }

        if ($filter.structure.$info) {
            $filter.structure.$info.hide(); // Hide no resutls msg
        }

        if ($filter.structure.$no_results) {
            $filter.structure.$no_results.hide(); // Hide no resutls msg
        }
    }

    Filter.prototype.initAC = function () {
        var $filter = this;
        $filter.keywords = $filter.getKeywords();

        if ($filter.keywords != undefined && $filter.keywords != null) {

            // Add tab completion
            $filter.structure.$input.tabcomplete($filter.keywords, {
                hint: $filter.options.hint,
                arrowKeys: $filter.options.arrowKeys,
                caseSensitive: $filter.options.caseSensitive,
                minLength: $filter.options.minLength,
                wrapInput: $filter.options.wrapInput
            });

            if ($filter.options.matches) {
                $filter.structure.$input
                    .on(
                        "match",
                        function(e, num) {
                            $filter.structure.$matches.css("opacity", (num == 0 ? 0 : 1)).find("span").html(num);
                        }
                    )
                    .on(
                        "blur",
                        function() {
                            $filter.structure.$matches.css("opacity", 0);
                        }
                    );
            }
        }
        else
        {
            console.log('no keywords defined!');
        }
    }

    Filter.prototype.searchAndFilter = function ( val ) {
        var $filter = this,
            resultsCount = 0;

        if (!val) {
            this.structure.$items.each(function () {
                if( !$(this).hasClass('disabled') ) {
                    $(this).show();
                }
            });
        } else {
            this.structure.$items.each(function () {
                if( !$(this).hasClass('disabled') ) {
                    var filters = $(this).attr('data-filter').split('|');
                    var show = $filter.inFilter(val, filters);
                    if (show) resultsCount++;
                    $(this).toggle(!!show);
                }
            });
        }

        return resultsCount;
    }

    Filter.prototype.clear = function() {
        this.structure.$input
            .val('')
            .trigger('input')
            .trigger('keyup');

        this.structure.$clear.addClass('hide'); // Hide clear button
    }

    Filter.prototype.inFilter = function(val, filter) {
        for (var i = 0; i < filter.length; i++) {
            var toParse = filter[i].toLowerCase();
            if (toParse.match(val)) return true;
        }
        return false;
    }

    //Todo Select on enter key

    // FILTER PLUGIN DEFINITION
    // ==============================

    function Plugin() {
        var arg = arguments;
        return this.each(function () {
            var $this   = $(this),
                data    = $this.data('liveFilter'),
                method  = arg[0];

            if( typeof(method) == 'object' || !method ) {
                var options = typeof method == 'object' && method;
                $this.data('liveFilter', (data = new Filter(this, options)));
            } else {
                if (data[method]) {
                    method = data[method];
                    arg = Array.prototype.slice.call(arg, 1);
                    if(arg != null || arg != undefined || arg != [])  method.apply(data, arg);
                } else {
                    $.error( 'Method ' +  method + ' does not exist on jQuery.Filter' );
                    return this;
                }
            }
        })
    }

    var old = $.fn.liveFilter

    $.fn.liveFilter             = Plugin
    $.fn.liveFilter.Constructor = Filter

    // FILTER NO CONFLICT
    // ========================

    $.fn.toggle.noConflict = function () {
        $.fn.liveFilter = old
        return this
    }

    // FILTER DATA-API
    // =====================

    $(function() {
        $('.livefilter').liveFilter();
    });
}(jQuery));