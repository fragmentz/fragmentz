fragmentz
=========

See "test/test-frags.html"

## Status
Very much under development. Consider this completely experimental.

- `html.css(cssStr, baseUri) : CSSFragment`  This works. The string is parsed as CSS, and any relative URLs are rewritten accoridng to baseUri.  The function returns a CSSFragment object, which allows the fragment to be attached/detached to/from the document.  The test-frags.html illustrates this in action.

- `html.html(htmlStr, baseUri) : DocumentFragment`  This works.  A document fragment is created using the given HTML string (Chrome 12+ will attempt to load resources at the time the fragment is created; nothing can be done about this). Any relative urls in the fragment are rewritten according to baseUri, and the resulting fragment is returned.  The test-frags.html illustrates this in action.

## Todo
- html.css() currently uses a standalone css parser.  this is heavy and slow.  It can probably be changed to use the browser's own facilities for parsing css.  AFAIK, all uplevel browsers allow access to Stylesheets and StylesheetRules of `<style>` elements in the page, and the `disabled` attribute can be used to ensure that a stylesheet doesn't affect the document until rewriting is complete.

- html.html() currently returns a DocumentFragment.  Instead, I think we should consider returning a nicer object that wraps DocumentFragment, and looks a lot like the `CSSFragment` object returned by `html.css()`.  The difference would be that `HtmlFragment.appendTo(someNode)` would need to clone the fragment's contents, allowing a single fragment to be parsed once, and attached many times.

- create AMD plugins for `html` and `css`.  the code in test-frags.html shows roughly what these plugins would do.

- the standalone css parser will still be needed for optimization runs (eg. through r.js) on node.  The existing grammars aren't fully correct for our needs, and so they need to be rewritten to match the [css spec](http://www.w3.org/TR/CSS21/syndata.html).

## Long Range Goals
- provide the option (in `html.html()` and `html.css()`) to do "sandboxing", where ids and css-classnames are prefixed to provide uniqueness.  This must be optional (off by default), and the prefix must be specified externally, so that it will be possible to rewrite an html fragment and a css fragment with matching prefixes. (note: this needs more thought. so think first, then write code).

- build a "widget system" that will wrap up the sandboxing functionality, into an amd plugin. Think lots more about this before building it.

## Notes
This is an [AMD](https://github.com/amdjs/amdjs-api/wiki) component. The examples/tests use [requirejs](http://requirejs.org/), but the module code itself should be compatible with any AMD-compliant loader.

## Credit
This presently uses parser code from [ometa-js](https://github.com/veged/ometa-js) by Alessandro Warth, Fedor Indutny, Sergey Berezhnoy, and others. That was based on Alessandro Warth's excellent [PHD dissertation](http://www.vpri.org/pdf/tr2008003_experimenting.pdf)  wherein he created the [parser language OMeta](http://www.tinlizzie.org/ometa/), and the dialect/environment [OmetaJS](https://github.com/alexwarth/ometa-js) ([and here](http://tinlizzie.org/ometa-js/#Sample_Project)); and his subsequent work where he has improved and evolved those things.

OmetaJS is provided under the MIT License; and of course, the parts of the ometa-js project that are included here retain that licesne.

Presently, this project also uses a portion of the CSS grammars from [cssp](https://github.com/css/cssp).

## License
fragmentz is provided under the [MIT License](https://github.com/coltrane/fragmentz/blob/master/LICENSE).

