if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function(require) {
  var uri = require('./mmc/uri'),
    cssParser = require('./css-parser/css-parser'),
    cssTranslator = require('./css-parser/css-translator'),
    document = window.document;

	var uriElements = [
		['a', 'href'],
		['applet','codebase'],
		['area','href'],
		['base','href'],
		['blockquote','cite'],
		['body','background'],
		['del','cite'],
		['form','action'],
		['frame','longdesc'], ['frame','src'],
		['head','profile'],
		['iframe','longdesc'], ['iframe','src'],
		['img','longdesc'], ['img','src'], ['img','usemap'],
		['input','src'], ['input','usemap'],
		['ins','cite'],
		['link','href'],
		['object','classid'],['object','codebase'],['object','data'],['object','usemap'],
		['q','cite'],
		['script','src'],
		['audio','src'],
		['button','formaction'],
		['command','icon'],
		['embed','src'],
		['html','manifest'],
		['input','formaction'],
		['source','src'],
		['video','poster'],['video','src'],
	].reduce(function(prev, cur, idx, all){
		var elName = String(cur[0]).toLowerCase(),
			atName = String(cur[1]).toLowerCase(),
			entry = prev[elName] || {};
		prev[elName] = entry;
		entry[atName] = true;
		return prev;
	}, {});

	/**
	* Convert rel uris to abs uris in an html fragment, using
	* provided baseUri.  The fragment is modified in-place,
	* and returned.
	*/
	function rebase(frag, baseUri) {
	  var baseUri = uri.parseUri(baseUri);
		walkHtml(frag, 1, function(el) {
			var entry = uriElements[String(el.nodeName).toLowerCase()];
			if (!entry) { return; }
			for(var i=0,len=el.attributes.length; i<len; ++i) {
				var attr = el.attributes[i];
				if( entry[String(attr.name).toLowerCase()] ) {
					attr.value = uri.resolveUri(attr.value, baseUri);
				}
			}
		});
		return frag;
	}

	/**
	* visits each element that is a descendant of the given fragment.
	*
	* @param frag : HtmlDocumentFragment | HtmlElement
	* @param whatToShow : Number - (optional) bitmask from NodeFilter SHOW_*
	*   defaults to NodeFilter.SHOW_ELEMENT
	* @param fn : Function - called once with each element.
	*
	* @return the fragment that was passed as `frag`
	*
	* EXAMPLE
	*   walkHtml(document.body, visitor, (NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT));
	*   function visitor(element, frag) {
	*     console.log(element.nodeName);
	*   }
	*
	*
	*/
	function walkHtml(frag, whatToShow, fn) {
	  fn = arguments[arguments.length-1];
	  if (isNaN(whatToShow)) { whatToShow = NodeFilter.SHOW_ELEMENT }
    var treeWalker = document.createTreeWalker(frag, whatToShow, null, false);
    while(treeWalker.nextNode()) fn(treeWalker.currentNode, frag);
  }

  /**
  * create a document fragment from the given htmlText.
  * if the baseUri is given, then modify the fragment
  * so that all relative URIs are transformed into absolute
  * URIs, using the given baseURI.
  */
  function html(htmlStr, baseUri) {
    var c,
      frag = document.createDocumentFragment();

    _fragmentTemp.innerHTML = htmlStr;
    while (c = _fragmentTemp.firstChild) { frag.appendChild(c); }
    if (baseUri != null) { rebase(frag, baseUri); }
    return frag;
  }
  var _fragmentTemp = document.createElement('div');

  /**
  * create a CSSFragment from the given css string.
  * if baseUri is given, then rewrite any relative
  * urls in the fragment, to abs urls, accordingly.
  */
  function css(cssStr, baseUri) {
    var err = null;
    if (baseUri != null) {
      baseUri = uri.parseUri(baseUri);
      var tree = cssParser.matchAll(cssStr, 'stylesheet', undefined, function(_err) {
        err = _err;
      });
      if (!err) {
        walkCss(tree, function(n) {
          if (n[0] !== 'uri') return;
          var val = n[1][1];
          n[1][1] = uri.resolveUri( val, baseUri, { allowInitialDots:true });
					console.log("resolved uri: ", val+ ' --> '+ n[1][1]);
        });
      }
      return new CSSFragment.createFromParse(err, (tree||cssStr));
    }
    return new CSSFragment.createFromStr(cssStr);
  }



  ////////

  function nextTick(f) {
    // todo: change to the "PostMessage trick."
    setTimeout(f, 0);
  }

  function walkCss(node, fn, type, top) {
    if (!Array.isArray(node)) { return; }
    if( !top ) top=node;
    var ntype = node[0], i = 1;
    while (i<node.length) {
      var e = node[i++];
      if (Array.isArray(e)) { walkCss(e, fn, type, top); }
    }
    if( !type || (ntype === type) ) fn(node, top);
  }

  function throwError(err, errCtx) {
      var e = new Error(errCtx +':'+ err);
      e.cssFragmentErrorDetail = err;
      throw e;
  }


  var styleElement = null;
  var cssFragmentsIe = [];
  /**
  * adds the given cssStr to a stylesheet in the dom
  * returns a "ticket" that can be used to remove the style at a later time.
  *
  * title and media don't currently work correctly (except the first time you
  * call this function). So don't use them.
  *
  * @param cssStr :string
  * @param title :string (optional)
  * @param media :string (optional) the media type of the stylesheet
  */
  function addCssText(cssStr, title, media){
    var el = styleElement;
    if (!el) {
      el = document.createElement('style');
      el.type = "text/css";
      el.media = media || 'screen';
      if(title) el.title = title;
    }
    cssStr = "/* */"+cssStr;
    if(el.styleSheet) {
      //IE only
      var txt = el.styleSheet.cssText;
      var ticket = {
        node : null, stylesheet: el.styleSheet, frags:cssFragmentsIe,
        offset: txt.length, len: null
      };
      el.styleSheet.cssText= txt + cssStr;
      ticket.len = (el.styleSheet.cssText.length)-ticket.offset;
      cssFragmentsIe.push(ticket);
    } else {
      // everyone else
      var ticket = {
        node : document.createTextNode(cssStr), stylesheet:null, frags:null,
        offset: 0, len: cssStr.len
      };
      el.appendChild(ticket.node);
    }
    if (!styleElement) {
      document.getElementsByTagName('head')[0].appendChild(el);
      styleElement = el;
    }
    return ticket;
  }

  function removeCssText(ticket) {
    var node = ticket.node,
      stylesheet = ticket.stylesheet;

    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
      return true;
    }
    if (!node && stylesheet) {
      // IE
      var frags = ticket.fragments,
        i=0, len=frags.length;

      while( i<len && frags[i] !== ticket) { ++i; }
      if(frags[i] === ticket) {
        var s = stylesheet.cssText;
        stylesheet.cssText = s.substring(0,ticket.offset) +
          s.substring(ticket.offset+ticket.len);
        frags.splice(i,1);
        while( i<len ) {
          frags[i].offset -= ticket.len;
          ++i;
        }
        return true;
      }
    }
    return false;
  }

  console.log("initialized styleElement=", styleElement);
  function CSSFragment(src) {
  }
  CSSFragment.createFromStr = function createFromStr(cssStr) {
    var obj = new CSSFragment();
    obj.css = cssStr;
    return obj;
  }
  CSSFragment.createFromParse = function createFromParse(err, treeOrStr) {
    var obj = new CSSFragment();
    if (err) {
      obj.err = err;
      obj.errCtx = "Parse Error";
    } else {
      if(typeof treeOrStr === 'string') {
        obj.css = treeOrStr;
      } else {
        obj.tree = treeOrStr;
        obj.css = cssTranslator.match(treeOrStr, 'stylesheet', undefined, function handleTxErr(err) {
          obj.err = err;
          obj.errCtx = "Translation Error";
        });
      }
    }
    return obj;
  }
  /**
  * attaches this css fragment to the dom.  throws an error if the
  * fragment is invalid for any reason.
  */
  CSSFragment.prototype.attach = function attach() {
    if (this.err) {
      throwError(this.err, this.errCtx)
    }
    if (this.ticket) { return; }
    this.ticket = addCssText(this.css);
    console.log("CSSFragment.attach: ticket=", this.ticket);
  }

  /**
  * experimental. removes this fragment from the page. adjusts offsets
  * of other fragments accordingly.
  */
  CSSFragment.prototype.detach = function detach() {
    console.log("CSSFragment.detach: ticket=", this.ticket);
    if (!this.ticket) return;
    removeCssText(this.ticket);
    this.ticket = null;
  }

  CSSFragment.prototype.parse = function parse() {
    var self = this;
    if (!self.tree) {
      self.tree = cssParser.matchAll(cssStr, 'stylesheet', undefined, function(err) {
        self.err = err;
        self.errCtx = "Parse Error";
      });
    }
    if( self.err ) {
      throwError(self.err, self.errCtx);
    }
    return tree;
  }

  /**
  * visit each node in the css doc's parse tree.  parse the doc if necessary.
  * all node types will be visited, unless `nodeType` indicates a specific
  * type to visit.
  *
  *   var css = CSSFragment.createFromStr(myCssStr);
  *   css.walk( function(node, top) {
  *     console.log("found a URI value: ", node[1]);
  *   }, 'uri');
  */
  CSSFragment.prototype.walk = function walk(fn, nodeType) {
    if (!self.tree) {
      self.parse();
    }
    walkCss(self.tree, fn, type);
  }

	return {
	  rebase : rebase,
	  walk : walkHtml,
		html : html,
		css : css,
	}
});
