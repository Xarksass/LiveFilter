# LiveFilter
## Description
A jQuery plugin to provide a live filter on a list.

## Requirements
Need [tabcomplete](https://github.com/erming/tabcomplete) for the auto-complete feature

## Basic usage
This is the basic html structure needed to use this plugin

```html
<div class="livefilter">
    <label class="sr-only" for="input-bts-ex-1">Search in the list</label>
    <div class="search-box">
        <div class="input-group">
            <span class="input-group-addon" id="search-icon1">
                <span class="fa fa-search"></span>
            </span>
            <input type="text" placeholder="Search in the list" id="input-bts-ex-1" class="form-control live-search" aria-describedby="search-icon1" />
        </div>
    </div>
    <div class="list-to-filter">
        <ul class="list-unstyled">
            <li class="filter-item" data-filter="item 1">item 1</li>
            <li class="filter-item" data-filter="item 2">item 2</li>
            <li class="filter-item" data-filter="item 3">item 3</li>
            <li class="filter-item" data-filter="item 4">item 4</li>
            <li class="filter-item" data-filter="item 5">item 5</li>
        </ul>
        <div class="no-search-results">
            <div class="alert alert-warning" role="alert"><i class="fa fa-warning margin-right-sm"></i>No entry for <strong>'<span></span>'</strong> was found.</div>
        </div>
    </div>
</div>
```

## Features
### Clear Button
You can add a clear button to allow the user to clear his filter by adding `data-clear="true"`

```html
<div class="livefilter" data-clear="true">
    <label class="sr-only" for="input-bts-ex-2">Search in the list</label>
    <div class="search-box">
        <div class="input-group">
            <span class="input-group-addon" id="search-icon2">
                <span class="fa fa-search"></span>
                <a href="#" class="fa fa-times hide filter-clear"><span class="sr-only">Clear filter</span></a>
            </span>
            <input type="text" placeholder="Search in the list" id="input-bts-ex-2" class="form-control live-search" aria-describedby="search-icon2" />
        </div>
    </div>
    <div class="list-to-filter">
        <ul class="list-unstyled">
            <li class="filter-item" data-filter="item 1">item 1</li>
            <li class="filter-item" data-filter="item 2">item 2</li>
            <li class="filter-item" data-filter="item 3">item 3</li>
            <li class="filter-item" data-filter="item 4">item 4</li>
            <li class="filter-item" data-filter="item 5">item 5</li>
        </ul>
        <div class="no-search-results">
            <div class="alert alert-warning" role="alert"><i class="fa fa-warning margin-right-sm"></i>No entry for <strong>'<span></span>'</strong> was found.</div>
        </div>
    </div>
</div>
```

### Auto-complete
You can add an auto-complete on your filter by adding `data-autocomplete="true"`
You can allow the user to navigate through matches with the arrow keys by adding `data-keys="true"`

```html
<div class="livefilter" data-clear="true" data-autocomplete="true" data-keys="true">
    <label class="sr-only" for="input-bts-ex-3">Search in the list</label>
    <div class="search-box">
        <div class="input-group">
            <span class="input-group-addon" id="search-icon3">
                <span class="fa fa-search"></span>
                <a href="#" class="fa fa-times hide filter-clear"><span class="sr-only">Clear filter</span></a>
            </span>
            <input type="text" placeholder="Search in the list" id="input-bts-ex-3" class="form-control live-search" aria-describedby="search-icon3" />
        </div>
    </div>
    <div class="list-to-filter">
        <ul class="list-unstyled">
            <li class="filter-item" data-filter="item 1">item 1</li>
            <li class="filter-item" data-filter="item 2">item 2</li>
            <li class="filter-item" data-filter="item 3">item 3</li>
            <li class="filter-item" data-filter="item 4">item 4</li>
            <li class="filter-item" data-filter="item 5">item 5</li>
        </ul>
        <div class="no-search-results">
            <div class="alert alert-warning" role="alert"><i class="fa fa-warning margin-right-sm"></i>No entry for <strong>'<span></span>'</strong> was found.</div>
        </div>
    </div>
</div>
```

### Matches
You can show the number of elements in the list which match the filter by adding `data-matches="true"`

```html
<div class="livefilter" data-clear="true" data-autocomplete="true" data-keys="true" data-matches="true">
    <label class="sr-only" for="input-bts-ex-4">Search in the list</label>
    <div class="matches">
        <span>0</span>
        found
    </div>
    <div class="search-box">
        <div class="input-group">
            <span class="input-group-addon" id="search-icon4">
                <span class="fa fa-search"></span>
                <a href="#" class="fa fa-times hide filter-clear"><span class="sr-only">Clear filter</span></a>
            </span>
            <input type="text" placeholder="Search in the list" id="input-bts-ex-4" class="form-control live-search" aria-describedby="search-icon4" />
        </div>
    </div>
    <div class="list-to-filter">
        <ul class="list-unstyled">
            <li class="filter-item" data-filter="item 1">item 1</li>
            <li class="filter-item" data-filter="item 2">item 2</li>
            <li class="filter-item" data-filter="item 3">item 3</li>
            <li class="filter-item" data-filter="item 4">item 4</li>
            <li class="filter-item" data-filter="item 5">item 5</li>
        </ul>
        <div class="no-search-results">
            <div class="alert alert-warning" role="alert"><i class="fa fa-warning margin-right-sm"></i>No entry for <strong>'<span></span>'</strong> was found.</div>
        </div>
    </div>
</div>
```