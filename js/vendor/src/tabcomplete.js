/*!
 * native tabcomplete
 * based on http://github.com/erming/tabcomplete
 * v1.0.0
 */
'use strict';
/**
 * Tabcomplete for tabcomplete.js v1.0.0
 */
class Tabcomplete {
	/**
	 * Constructor
	 * @param {HTMLInputElement} element
	 * @param {Array} keywords
	 * @param {Object} options
	 */
	constructor(element, keywords, options) {
		this.version = '1.0.0';
		this.utils = {
			keys: {
				backspace: 8,
				tab: 9,
				enter: 13,
				left: 37,
				up: 38,
				right: 39,
				down: 40
			},
			eventFire: function(el, etype, data) {
				if(typeof data !== "undefined") el.eventData = data;
				if (el.fireEvent) {
					el.fireEvent('on' + etype);
				} else {
					var evObj = document.createEvent('Events');
					evObj.initEvent(etype, true, false);
					el.dispatchEvent(evObj);
				}
			},
			isInput: function(o){
				return (
					typeof HTMLInputElement === "object" ? o instanceof HTMLInputElement : //DOM2
						o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
				);
			}
		};
		this.elem = element;
		this.keywords = keywords;
		this.defaultOptions = {
			after: "",
			arrowKeys: true,    // Allow the use of <up> and <down> keys to iterate
			hint: "placeholder", // "placeholder", "select", false
			match: this.match,
			caseSensitive: false,
			minLength: 1,
			wrapInput: true,
			complete: 'tab' // key to choose and switch between proposition, either tab, enter or right
		};
		this.options = Object.assign({}, this.defaultOptions, options);
		this.elem.tabcomplete = this;
		this.iteration = {
			backspace: false,
			complete: false,
			i: -1,
			words: [],
			last: "",
		};
		this.init();
	}

	/**
	 * Override options
	 * @param options
	 */
	set(options) {
		let TC = this;
		TC.options = Object.assign({}, TC.options, options);
		TC.reset();
	}

	/**
	 * Initialise event handlers
	 */
	init() {
		let TC = this;
		let tag = TC.elem.tagName;
		if (tag !== "INPUT" && tag !== "TEXTAREA") return;
		let prev = TC.elem.previousSibling;
		if(TC.utils.isInput(prev) && prev.classList.contains("hint")) prev.remove();

		TC.elem.addEventListener('input',TC.onInput);
		TC.elem.addEventListener("keydown",TC.onKeydown);
		TC.elem.addEventListener("blur",TC.onBlur);

		if (TC.options.hint) TC.hint("");
	}

	/**
	 * Reset event Tabcomplete
	 */
	reset() {
		let TC = this;
		TC.elem.removeEventListener('input',TC.onInput);
		TC.elem.removeEventListener("keydown",TC.onKeydown);
		TC.elem.removeEventListener("blur",TC.onBlur);
		TC.init();
	}

	/**
	 * Reset iteration
	 */
	resetIteration() {
		this.iteration.i = -1;
		this.iteration.last = "";
		this.iteration.words = [];
	}

	/**
	 * On input handler
	 * @param e
	 */
	onInput(e) {
		let TC = this.tabcomplete,
			val = TC.elem.value,
			word = val.split(/ |\n/).pop();

		if(TC === undefined) return;

		// Reset iteration.
		TC.resetIteration();

		// Check for matches if the current word is the last word.
		if (TC.elem.selectionStart === val.length && word.length) {
			// Call the match() function to filter the words.
			TC.iteration.words = TC.options.match(word, TC.keywords, TC.options.caseSensitive);

			// Append 'after' to each word.
			if (TC.options.after !== "") TC.iteration.words = TC.iteration.words.map(function (w){ return w + TC.options.after; });
		}

		// Emit the number of matching words with the 'match' event.
		TC.utils.eventFire(TC.elem,'match',TC.iteration.words.length);

		if (TC.options.hint === 'select' || TC.options.hint === 'placeholder') {
			if (
				!(TC.options.hint === "select" && TC.iteration.backspace)
				&& word.length >= TC.options.minLength) {
				// Show hint.
				TC.hint(TC.iteration.words[0]);
			}
			else {
				// Clear hinting.
				// This call is needed when using backspace.
				TC.hint("");
			}
		}

		if (TC.iteration.backspace) TC.iteration.backspace = false;
	}

	/**
	 * On keydown handler
	 * @param e
	 */
	onKeydown(e) {
		let TC = this.tabcomplete,
			key = e.which;

		if(TC === undefined) return;

		// Ignore modifier keys
		if (e.ctrlKey || e.shiftKey || e.altKey) return;

		if(!TC.iteration.complete) TC.elem.typed = TC.elem.value;

		switch (key) {
			case TC.utils.keys[TC.options.complete]:
				// Don't lose focus on tab click.
				// Don't submit on enter click
				e.preventDefault();

				// Get next match.
				let word = TC.iteration.i < 0 ? TC.iteration.words[0] : TC.iteration.words[TC.iteration.i % TC.iteration.words.length];
				if (!word) return;

				let value = TC.elem.value;
				TC.iteration.last = TC.iteration.last || value.split(/ |\n/).pop();

				// Return if the 'minLength' requirement isn't met.
				if (TC.iteration.last.length < TC.options.minLength || value.length === word.length) return;

				// Update element with the completed text.
				let text = TC.options.hint === "select" ? value : value.substr(0, TC.elem.selectionStart - TC.iteration.last.length) + word;
				TC.elem.value = text;

				// Put the cursor at the end after completion.
				// This isn't strictly necessary, but solves an issue with
				// Internet Explorer.
				if (TC.options.hint === "select") TC.elem.selectionStart = text.length;

				// Remember the word until next time.
				TC.iteration.last = word;

				// Emit event.
				//TC.trigger("tabcomplete", last);
				TC.utils.eventFire(TC.elem,"tabcomplete",TC.iteration.last);

				if (TC.options.hint) {
					// Turn off any additional hinting.
					TC.hint("");
				}

				TC.iteration.complete = true;
				break;
			case TC.utils.keys.up:
			case TC.utils.keys.down:
				if(TC.options.arrowKeys) {
					// Iterate the matches with tab and the up and down keys by incrementing
					// or decrementing the 'i' variable.
					if (key !== TC.utils.keys.up) {
						TC.iteration.i++;
					}
					else {
						if (TC.iteration.i === -1) return;
						if (TC.iteration.i === 0) {
							// Jump to the last word.
							TC.iteration.i = TC.iteration.words.length - 1;
						} else {
							TC.iteration.i--;
						}
					}

					// Get next match.
					let word = TC.iteration.words[TC.iteration.i % TC.iteration.words.length];
					if (!word) return;

					let value = TC.elem.value;
					TC.iteration.last = TC.iteration.last || value.split(/ |\n/).pop();

					// Return if the 'minLength' requirement isn't met.
					if (TC.iteration.last.length < TC.options.minLength) return;

					// Remember the word until next time.
					TC.iteration.last = word;

					if (TC.options.hint) {
						// Switch hint
						TC.hint(word);
					}
					else {
						// Update element with the completed text.
						let text = TC.options.hint === "select" ? value : value.substr(0, TC.elem.selectionStart - TC.iteration.last.length) + word;
						TC.elem.value = text;

						// Put the cursor at the end after completion.
						// This isn't strictly necessary, but solves an issue with
						// Internet Explorer.
						if (TC.options.hint === "select") TC.elem.selectionStart = text.length;
						// Emit event.
						//TC.trigger("tabcomplete", last);
						TC.utils.eventFire(TC.elem,"tabcomplete",TC.iteration.last);
					}
				}
				break;
			case TC.utils.keys.backspace:
				// Remember that backspace|left was pressed. This is used by the 'input' event.
				if(TC.elem.value !== TC.elem.typed) TC.iteration.complete = false;
				TC.iteration.backspace = true;

				// Reset iteration.
				TC.resetIteration();
				if (TC.options.hint) TC.hint("");
				break;
			case TC.utils.keys.left:
				if(TC.elem.typed !== undefined) {
					e.preventDefault();
					TC.elem.value = TC.elem.typed;
					TC.iteration.complete = false;
				}
				break;
			default:
				if(TC.elem.value !== TC.elem.typed) TC.iteration.complete = false;
				if (TC.options.hint) {
					TC.resetIteration();
					TC.hint("");
				}
		}
	}

	/**
	 * On blur event
	 * @param e
	 */
	onBlur(e) {
		let TC = this.tabcomplete;
		if(TC === undefined) return;
		TC.resetIteration();
		if (TC.options.hint) TC.hint("");
	}

	/**
	 * Display hint
	 * @param word
	 */
	hint(word) {
		let TC = this;
		switch (TC.options.hint) {
			case "placeholder":
				TC.placeholder(word);
				break;
			case "select":
				TC.select(word);
				break;
		}
	}

	/**
	 * Simple matching.
	 * Filter the array and return the items that begins with 'word'.
	 * @param word
	 * @param array
	 * @param caseSensitive
	 * @returns {*}
	 */
	match(word, array, caseSensitive) {
		return array.filter(
			function(w) {
				return caseSensitive ? !w.indexOf(word) : !w.toLowerCase().indexOf(word.toLowerCase());
			}
		);
	}

	/**
	 * Show placeholder text.
	 * This works by creating a copy of the input and placing it behind
	 * the real input.
	 * @param word
	 */
	placeholder(word) {
		let TC = this,
			input = TC.elem,
			prev = input.previousSibling;
		let clone = (TC.utils.isInput(prev) && prev.classList.contains("hint")) ? prev : false;

		input.style.backgroundColor = "transparent";
		input.style.position = "relative";

		// Lets create a clone of the input if it does
		// not already exist.
		if (clone === false) {
			if (TC.options.wrapInput) {
				let next = input.nextSibling;
				let parent = input.parentElement;
				let wrapper = document.createElement('div');
				wrapper.style.position = "relative";
				wrapper.style.height = input.style.height;
				wrapper.style.display = input.style.display === "block" ? "block" : "inline-block";
				parent.insertBefore(wrapper,next);
				wrapper = input.nextSibling;
				wrapper.insertBefore(input,null);
				//input = parent.querySelector('input');
			}

			clone = input.cloneNode(true);
			clone.setAttribute('tabindex',-1);
			clone.removeAttribute('id');
			clone.removeAttribute('name');
			clone.removeAttribute('placeholder');
			clone.classList.add('hint');
			input.parentElement.insertBefore(clone,input);
			clone.style.position = "absolute";
		}

		let hint = "";
		if (typeof word === "string") {
			let value = input.value;
			hint = value + word.substr(value.split(/ |\n/).pop().length);
		}

		clone.value = hint;
	}

	/**
	 * Hint by selecting part of the suggested word.
	 * @param word
	 */
	select(word) {
		let input = this.elem;
		let value = input.value;
		if (word) {
			input.value = value + word.substr(value.split(/ |\n/).pop().length);
			// Select hint.
			input.selectionStart = value.length;
		}
	}
}