/*! ========================================================================
 * LiveFilter for nativeLivefilter.js v1.0.0
 * ========================================================================
 * Copyright 201, Salvatore Di Salvo (disalvo-infographiste[dot].be)
 * ======================================================================== */
'use strict';
/**
 * LiveFilter for nativeLivefilter.js v1.0.0
 */
class liveFilter {
    /**
     * Constructor
     * @param {Element} element
     * @param {Object} options
     */
    constructor(element, options) {
        this.version = '1.0.0';
        this.utils = {
            eventFire: function(el, etype, data) {
                if(typeof data !== "undefined") el.eventData = data;
                if (el.fireEvent) {
                    el.fireEvent('on' + etype);
                } else {
                    var evObj = document.createEvent('Events');
                    evObj.initEvent(etype, true, false);
                    el.dispatchEvent(evObj);
                }
            }
        };
        this.element = element;
        this.defaults = {
            clearbtn : false,
            textinfo : true,
            autocomplete : false,   // Allow auto-completion
            hint: "placeholder",    // "placeholder", "select", false
            arrowKeys: false,       // Allow the use of <up> and <down> keys to iterate
            matches: false,         // Show the number the number of elements in the list which match the filter
            caseSensitive: false,
            minLength: 1,
            wrapInput: true,
            hideClass: 'hide'
        };
        this.options = Object.assign({}, this.parseData(), options);
        this.structure = Object.assign({}, this.parts());
        this.element.filterList = this;
        this.keywords = null;
        this.init();
    }

    /**
     * Parse structure data to override default settings
     * @returns Object
     */
    parseData() {
        return {
            clearbtn      : this.element.dataset.clear || this.defaults.clearbtn,
            textinfo      : this.element.dataset.textinfo || this.defaults.textinfo,
            autocomplete  : this.element.dataset.autocomplete || this.defaults.autocomplete,
            hint          : this.element.dataset.hint || this.defaults.hint,
            arrowKeys     : this.element.dataset.keys || this.defaults.arrowKeys,
            matches       : this.element.dataset.matches || this.defaults.arrowKeys,
            caseSensitive : this.defaults.caseSensitive,
            minLength     : this.defaults.minLength,
            wrapInput     : this.defaults.wrapInput,
            hideClass     : this.element.dataset.hideClass || this.defaults.hideClass
        }
    }

    /**
     * Return structure elements
     * @returns Object
     */
    parts() {
        return {
            $input      : this.element.querySelectorAll('.live-search'),
            $filter     : this.element.querySelectorAll('.list-to-filter'),
            $clear      : this.element.querySelectorAll('.filter-clear'),
            $no_results : this.element.querySelectorAll('.no-search-results'),
            $info       : this.element.querySelectorAll('.filter-info'),
            $val        : this.element.querySelectorAll('.filter-val'),
            $items      : this.element.querySelectorAll('.filter-item'),
            $matches    : this.element.querySelectorAll('.matches')
        }
    }

    /**
     * Initialise events
     */
    init() {
        let LF = this;

        if (LF.options.autocomplete) LF.initAC();

        if (LF.options.clearbtn) {
            LF.structure.$clear.forEach(function(c){
                c.addEventListener('click', function (e) {
                    e.preventDefault();
                    LF.clear()
                });
            });
        }

        LF.structure.$input.forEach(function(i){
            i.addEventListener('keyup',function () {
                let val = i.value.toLowerCase();

                LF.structure.$val.forEach(function (v) {
                    v.innerText = val;
                });

                if (LF.options.clearbtn) {
                    LF.structure.$clear.forEach(function (cl) {
                        cl.classList.toggle(LF.options.hideClass, !val);
                        let prev = cl.previousSibling;
                        if(prev.nodeName === 'SPAN') prev.classList.toggle(LF.options.hideClass,!val);
                    });
                }

                let resultsCount = LF.searchAndFilter(val);
                LF.structure.$no_results.forEach(function(nr){
                    nr.classList.toggle(LF.options.hideClass,(resultsCount !== 0 || val.length === 0));
                });
                if(LF.options.textinfo) {
                    LF.structure.$info.forEach(function(i){
                        i.classList.toggle(LF.options.hideClass,(val.length === 0 || val === '') || resultsCount === 0);
                    });
                }
            });
        });

        LF.structure.$input.forEach(function(i){
            i.value = '';
            LF.utils.eventFire(i,'input');
            LF.utils.eventFire(i,'keyup');
        });

        if (LF.structure.$clear && LF.options.clearbtn) {
            LF.structure.$clear.forEach(function(cl){
                cl.classList.add(LF.options.hideClass);
                let prev = cl.previousSibling;
                if(prev.nodeName === 'SPAN') prev.classList.remove(LF.options.hideClass);
            });
        }

        if (LF.structure.$info) {
            LF.structure.$info.forEach(function(i){
                i.classList.add(LF.options.hideClass);
            });
        }

        if (LF.structure.$no_results) {
            LF.structure.$no_results.forEach(function(i){
                i.classList.add(LF.options.hideClass);
            });
        }
    }

    /**
     * Retreive and return the keywords
     * @returns {Array}
     */
    getKeywords() {
        let keywords = [];
        this.structure.$items.forEach(function(i){
            if(!i.classList.contains('disabled'))
                keywords = keywords.concat(i.dataset.filter.split('|'));
        });
        return keywords;
    }

    /**
     * Initialize autocomplete
     */
    initAC() {
        let LF = this;
        LF.keywords = LF.getKeywords();

        if (LF.keywords !== undefined && LF.keywords !== null) {
            // Add tab completion
            LF.structure.$input.forEach(function(i){
                let TC = new Tabcomplete(i, LF.keywords, {
                    hint: LF.options.hint,
                    arrowKeys: LF.options.arrowKeys,
                    caseSensitive: LF.options.caseSensitive,
                    minLength: LF.options.minLength,
                    wrapInput: LF.options.wrapInput
                });
            });

            if (LF.options.matches) {
                LF.structure.$input.forEach(function(i){
                    i.addEventListener('match',function(e){
                        if(typeof e.target.eventData !== "undefined") {
                            let num = e.target.eventData;
                            LF.structure.$matches.forEach(function(m){
                                m.style.opacity = num === 0 ? '0' : '1';
                                m.querySelectorAll('span').forEach(function(s){
                                    s.innerHTML = num;
                                });
                            });
                        }

                    });
                    i.addEventListener('blur',function(){
                        LF.structure.$matches.forEach(function(m){
                            m.style.opacity = '0';
                        });
                    });
                });
            }
        }
        else
        {
            console.log('no keywords defined!');
        }
    }

    /**
     * Search and filter value list
     * @param val
     * @returns {number}
     */
    searchAndFilter(val) {
        let LF = this,
            resultsCount = 0;

        this.structure.$items.forEach(function(i){
            if(!i.classList.contains('disabled')) {
                if(!val) {
                    i.classList.remove(LF.options.hideClass);
                }
                else {
                    let filters = i.dataset.filter.split('|');
                    let show = LF.inFilter(val, filters);
                    if (show) resultsCount++;
                    i.classList.toggle(LF.options.hideClass,!show);
                }
            }
        });

        return resultsCount;
    }

    /**
     *
     */
    clear() {
        let LF = this;

        LF.structure.$input.forEach(function(i){
            i.value = '';
            LF.utils.eventFire(i,'input');
            LF.utils.eventFire(i,'keyup');
        });

        LF.structure.$clear.forEach(function(cl){
            cl.classList.add(LF.options.hideClass);
        });
    }

    /**
     *
     * @param val
     * @param filter
     * @returns {boolean}
     */
    inFilter(val, filter) {
        for (var i = 0; i < filter.length; i++) {
            let toParse = filter[i].toLowerCase();
            if (toParse.match(val)) return true;
        }
        return false;
    }
}

window.addEventListener('load',function(){
    document.querySelectorAll('.livefilter').forEach(function(lf) {
        new liveFilter(lf);
    });
});