if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function(require) {

  var _ = require('underscore');

  /**
  * normalize_path - removes all dot-segments (/./), and correctly resolves all '/../' segments in
  * the expected way.  resulting path shall have no slashes at the start or end of the path.j
  * this makes for the easiest and most flexible means of concating paths safely elsewhere in code.
  * so, the following should always work as intended:
  *    var pathC = normalize_path(pathA)+'/'+normalize_path(pathB);
  *    openFile( 'file:///'+pathC );
  */
  function normalize_path(path) {
    var new_path = '';
    path = path || '';
    var segs = path.split('/');
    for( var i=segs.length; i--; ) {
      var seg = segs[i];
      switch(seg) {
        case '..':
          --i;
          break;
        case '.':
        case '':
          break;
        default:
          new_path = seg+((new_path)?('/'+new_path):'');
      }
    }
    return new_path;
  }

	function uri() {
	}
	uri.prototype.toString = function() {
		return formatUri(this);
	}

  var rxUriParts = /^(?:([^:\/\?#]*):)?(?:\/\/([^\/\?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/;
  function parseUri( _uri ) {
    if( typeof _uri === 'object' && !(_uri instanceof String) ) {
      // already parsed
      return _uri;
    }
    // dirty uri parse (could probably be improved)
    var parts = String(_uri).match(rxUriParts);
    _uri = new uri();
    if( parts[1] ) { _uri.scheme = parts[1]; }
    if( parts[2] ) { _uri.host = parts[2]; }
    _uri.path = parts[3] || '';
    if( parts[4] ) { _uri.query = parseQueryString(parts[4]); }
    if( parts[5] ) { _uri.fragment = parts[5]; }
    return _uri;
  }
  function parseQueryString( qs ) {
    var query = {};
    if( qs ) {
      for( var i=0, parts=qs.split('&'), len=parts.length, val; val=parts[i], i<len; ++i ) {
        val = val.split('=');
        var name = unescape(val.shift());
        query[name] = merge_qs_values(query[name], unescape( val.join('=')));
      }
    }
    return query;
  }
  /**
  * Returns an array containing all the values of all the arguments in-order.
  * Any argument that is itself an array will be expanded as though each member
  * had been passed as a separate argument. Any `undefined` value will be
  * ignored.  If the result would be an empty array, `undefined` will be
  * returned instead. If the result would be a single-element array, the
  * element will be returned instead of the array.
  */
  function merge_qs_values(v1, v2) {
    var a = [];
    for( var i =0; i<arguments.length; ++i ) {
      var v = arguments[i];
      if( v === undefined ) { continue; }
      if( Array.isArray(v) ) {
        a = a.concat(v);
      } else {
        a.push( v );
      }
    }
    if( a.length === 0 ) { return undefined; }
    if( a.length === 1 ) { return a[0]; }
    return a;
  }



  function formatUri( uri ) {
    if( typeof uri !== 'object' || uri===null || uri instanceof String ) {
      return uri;
    }
    var s = '';
    if( uri.scheme ) { s+= uri.scheme+':'; }
    if( uri.host!=null ) { s+= '//'+uri.host; }
      if( uri.path ) {
        if( uri.host!=null && uri.path[0] !== '/' ) { s+= '/'; }
        s+= uri.path;
      }
      if( uri.query ) {
        var qs = formatQueryString(uri.query);
        if( qs ) { s+= '?'+qs; }
      }
      if( uri.fragment ) {
        s+= '#'+uri.fragment;
      }
      return s;
  }
  function formatQueryString( query ) {
    var s = [];
    Object.keys(query).forEach(function(k) {
      var v = query[k];
      s.push(escape(k)+'='+escape(v));
    });
    return s.join('&');
  }


  // this implementation is derived from the
  // algorithm described by "RFC 3986: section 5.2"
  // (http://tools.ietf.org/html/rfc3986#section-5.2)
  function resolveUri(uri, base, options) {
    var allowInitialDots = false;
    if (options) {
      allowInitialDots = !!(options.allowInitialDots);
    }

    base = base || '/';
    base = parseUri(base);

    //uri = _.extend({}, parseUri(uri));
		uri = Object.create(parseUri(uri));

    uri.path = uri.path || '';

    var uriSegs = uri.path.split('/');
    var baseSegs = (base.path || '').split('/');

    if (uri.scheme) return done();
    uri.scheme = base.scheme;

    if (uri.host) return done();
    uri.host = base.host;

    if(uri.path === '') {
      uriSegs = baseSegs;
      if (uri.query == null) uri.query = base.query;
    } else if (uri.path[0] !== '/') {
      // merge paths
      if(base.host != null && base.path=='') {
        uriSegs = _merge_path_segs('/', uriSegs);
      } else {
        uriSegs = _merge_path_segs(baseSegs, uriSegs);
        //baseSegs.pop();
        //uriSegs = baseSegs.concat(uriSegs);
      }
    }
    return done();

    function done() {
      uriSegs = _remove_dot_segments(uriSegs, allowInitialDots);
      uri.path = uriSegs.join('/');
      return uri;
    }
  }

  function merge_paths( base, rel ) {
    return _merge_path_segs(base, rel).join('/');
  }
  function _merge_path_segs(base, rel) {
    if (!Array.isArray(base)) base = String(base).split('/');
    if (!Array.isArray(rel)) rel = String(rel).split('/');
    return base.slice(0,-1).concat(rel);
  }

  function _remove_dot_segments(segs, allowInitialDots) {
    var seg, result=[], i=0;
    allowInitialDots = !!(allowInitialDots) || false;
    var initialDots = [];

    while ((seg=segs[i++]) != null) {
      if( seg === '.' ) {
        if(result.length===0 && allowInitialDots) { initialDots.push(seg); }
        continue;
      }
      if( seg === '..') {
        result.pop();
        if (result.length===0 && allowInitialDots) { initialDots.push(seg); }
        continue;
      }
      if (result.length === 0 && allowInitialDots) {
        result = initialDots;
        initialDots = [];
      }
      result.push(seg);
    }
    return result;
  }


  return {
    parseUri : parseUri,
    resolveUri : resolveUri,
    formatUri : formatUri,
    parseQueryString : parseQueryString,
    formatQueryString : formatQueryString,
    merge_qs_values : merge_qs_values,
  }
});

