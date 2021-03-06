if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function(require,exports,module) {

var AbstractGrammar = require("./grammar");

var BSJSParser = function BSJSParser(source) {
    AbstractGrammar.call(this, source);
};

BSJSParser.grammarName = "BSJSParser";

BSJSParser.match = AbstractGrammar.match;

BSJSParser.matchAll = AbstractGrammar.matchAll;

exports.BSJSParser = BSJSParser;

require("./util").inherits(BSJSParser, AbstractGrammar);

BSJSParser.prototype["space"] = function $space() {
    return this._atomic(function() {
        return this._rule("space", true, [], AbstractGrammar, AbstractGrammar.prototype["space"]);
    }) || this._seq(/^\/\/[^\n]*/) || this._seq(/^\/\*(.|[\r\n])*?\*\//);
};

BSJSParser.prototype["nameFirst"] = function $nameFirst() {
    return this._seq(/^[a-z$_]/i);
};

BSJSParser.prototype["nameLast"] = function $nameLast() {
    return this._seq(/^[a-z0-9$_]/i);
};

BSJSParser.prototype["iName"] = function $iName() {
    return this._seq(/^[a-z$_][a-z0-9$_]*/i);
};

BSJSParser.prototype["isKeyword"] = function $isKeyword() {
    var x;
    return this._skip() && (x = this._getIntermediate(), true) && BSJSParser._isKeyword(x);
};

BSJSParser.prototype["name"] = function $name() {
    var n;
    return this._rule("iName", true, [], null, this["iName"]) && (n = this._getIntermediate(), true) && !this._atomic(function() {
        return this._rule("isKeyword", false, [ n ], null, this["isKeyword"]);
    }, true) && this._exec([ "name", n ]);
};

BSJSParser.prototype["keyword"] = function $keyword() {
    var k;
    return this._rule("iName", true, [], null, this["iName"]) && (k = this._getIntermediate(), true) && this._rule("isKeyword", false, [ k ], null, this["isKeyword"]) && this._exec([ k, k ]);
};

BSJSParser.prototype["hexDigit"] = function $hexDigit() {
    var x, v;
    return this._rule("char", true, [], null, this["char"]) && (x = this._getIntermediate(), true) && this._exec(BSJSParser.hexDigits.indexOf(x.toLowerCase())) && (v = this._getIntermediate(), true) && v >= 0 && this._exec(v);
};

BSJSParser.prototype["hexLit"] = function $hexLit() {
    return this._atomic(function() {
        var n, d;
        return this._rule("hexLit", false, [], null, this["hexLit"]) && (n = this._getIntermediate(), true) && this._rule("hexDigit", false, [], null, this["hexDigit"]) && (d = this._getIntermediate(), true) && this._exec(n * 16 + d);
    }) || this._atomic(function() {
        return this._rule("hexDigit", false, [], null, this["hexDigit"]);
    });
};

BSJSParser.prototype["number"] = function $number() {
    return this._atomic(function() {
        var n;
        return this._seq(/^0x[0-9a-f]+/) && (n = this._getIntermediate(), true) && this._exec([ "number", parseInt(n) ]);
    }) || this._atomic(function() {
        var f;
        return this._seq(/^\d+((\.|[eE][\-+]?)\d+)?/) && (f = this._getIntermediate(), true) && this._exec([ "number", parseFloat(f) ]);
    });
};

BSJSParser.prototype["escapeChar"] = function $escapeChar() {
    return this._atomic(function() {
        var s;
        return this._list(function() {
            return this._match("\\") && this._rule("char", false, [], null, this["char"]);
        }, true) && (s = this._getIntermediate(), true) && this._exec(function() {
            switch (s) {
              case '\\"':
                return '"';
              case "\\'":
                return "'";
              case "\\n":
                return "\n";
              case "\\r":
                return "\r";
              case "\\t":
                return "	";
              case "\\b":
                return "\b";
              case "\\f":
                return "\f";
              case "\\\\":
                return "\\";
              default:
                return s.charAt(1);
            }
        }.call(this));
    }) || this._atomic(function() {
        var s;
        return this._list(function() {
            return this._match("\\") && (this._atomic(function() {
                return this._match("u") && this._rule("hexDigit", false, [], null, this["hexDigit"]) && this._rule("hexDigit", false, [], null, this["hexDigit"]) && this._rule("hexDigit", false, [], null, this["hexDigit"]) && this._rule("hexDigit", false, [], null, this["hexDigit"]);
            }) || this._atomic(function() {
                return this._match("x") && this._rule("hexDigit", false, [], null, this["hexDigit"]) && this._rule("hexDigit", false, [], null, this["hexDigit"]);
            }));
        }, true) && (s = this._getIntermediate(), true) && this._exec(function() {
            return JSON.parse('"' + s + '"');
        }.call(this));
    });
};

BSJSParser.prototype["str"] = function $str() {
    return this._atomic(function() {
        var s;
        return this._seq(/^'([^'\\]|\\.)*'/) && (s = this._getIntermediate(), true) && this._exec(function() {
            function swap(quote) {
                return quote === '"' ? "'" : '"';
            }
            return [ "string", JSON.parse(preparseString(s.replace(/["']/g, swap))).replace(/["']/g, swap) ];
        }.call(this));
    }) || this._atomic(function() {
        var s;
        return this._seq(/^"([^"\\]|\\.)*"/) && (s = this._getIntermediate(), true) && this._exec([ "string", JSON.parse(preparseString(s)) ]);
    });
};

BSJSParser.prototype["special"] = function $special() {
    var s;
    return this._seq(/^(>>>|<<<|!==|===|&&=|\|\|=|!=|==|>=|<=|\+\+|\+=|--|-=|\*=|\/=|%=|&&|\|\||>>|&=|\|=|\^=|[\(\){}\[\],;?:><=\+\-\*\/%&|\^~\.!])/) && (s = this._getIntermediate(), true) && this._exec([ s, s ]);
};

BSJSParser.prototype["token"] = function $token() {
    return this._rule("spaces", true, [], null, this["spaces"]) && (this._atomic(function() {
        return this._rule("name", true, [], null, this["name"]);
    }) || this._atomic(function() {
        return this._rule("keyword", true, [], null, this["keyword"]);
    }) || this._atomic(function() {
        return this._rule("number", true, [], null, this["number"]);
    }) || this._atomic(function() {
        return this._rule("str", true, [], null, this["str"]);
    }) || this._atomic(function() {
        return this._rule("special", true, [], null, this["special"]);
    }));
};

BSJSParser.prototype["toks"] = function $toks() {
    var ts;
    return this._any(function() {
        return this._atomic(function() {
            return this._rule("token", true, [], null, this["token"]);
        });
    }) && (ts = this._getIntermediate(), true) && this._rule("spaces", true, [], null, this["spaces"]) && this._rule("end", false, [], null, this["end"]) && this._exec(ts);
};

BSJSParser.prototype["spacesNoNl"] = function $spacesNoNl() {
    return this._any(function() {
        return this._atomic(function() {
            return !this._atomic(function() {
                return this._match("\n");
            }, true) && this._rule("space", false, [], null, this["space"]);
        });
    });
};

BSJSParser.prototype["expr"] = function $expr() {
    return this._rule("commaExpr", false, [], null, this["commaExpr"]);
};

BSJSParser.prototype["commaExpr"] = function $commaExpr() {
    return this._atomic(function() {
        var e1, e2;
        return this._rule("commaExpr", false, [], null, this["commaExpr"]) && (e1 = this._getIntermediate(), true) && this._rule("token", true, [ "," ], null, this["token"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (e2 = this._getIntermediate(), true) && this._exec([ "binop", ",", e1, e2 ]);
    }) || this._atomic(function() {
        return this._rule("asgnExpr", false, [], null, this["asgnExpr"]);
    });
};

BSJSParser.prototype["asgnExpr"] = function $asgnExpr() {
    var e;
    return this._rule("condExpr", false, [], null, this["condExpr"]) && (e = this._getIntermediate(), true) && (this._atomic(function() {
        var rhs;
        return this._rule("token", true, [ "=" ], null, this["token"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (rhs = this._getIntermediate(), true) && this._exec([ "set", e, rhs ]);
    }) || this._atomic(function() {
        var op, rhs;
        return (this._atomic(function() {
            return this._rule("token", true, [ "+=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "-=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "*=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "/=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "&&=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "||=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "%=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "<<=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ ">>=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ ">>>=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "&=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "^=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "|=" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (rhs = this._getIntermediate(), true) && this._exec([ "mset", e, op.slice(0, -1), rhs ]);
    }) || this._atomic(function() {
        return this._rule("empty", false, [], null, this["empty"]) && this._exec(e);
    }));
};

BSJSParser.prototype["condExpr"] = function $condExpr() {
    var e;
    return this._rule("orExpr", false, [], null, this["orExpr"]) && (e = this._getIntermediate(), true) && (this._atomic(function() {
        var t, f;
        return this._rule("token", true, [ "?" ], null, this["token"]) && this._rule("condExpr", false, [], null, this["condExpr"]) && (t = this._getIntermediate(), true) && this._rule("token", true, [ ":" ], null, this["token"]) && this._rule("condExpr", false, [], null, this["condExpr"]) && (f = this._getIntermediate(), true) && this._exec([ "condExpr", e, t, f ]);
    }) || this._atomic(function() {
        return this._rule("empty", false, [], null, this["empty"]) && this._exec(e);
    }));
};

BSJSParser.prototype["orExpr"] = function $orExpr() {
    return this._atomic(function() {
        var x, y;
        return this._rule("orExpr", false, [], null, this["orExpr"]) && (x = this._getIntermediate(), true) && this._rule("token", true, [ "||" ], null, this["token"]) && this._rule("andExpr", false, [], null, this["andExpr"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", "||", x, y ]);
    }) || this._atomic(function() {
        return this._rule("andExpr", false, [], null, this["andExpr"]);
    });
};

BSJSParser.prototype["andExpr"] = function $andExpr() {
    return this._atomic(function() {
        var x, y;
        return this._rule("andExpr", false, [], null, this["andExpr"]) && (x = this._getIntermediate(), true) && this._rule("token", true, [ "&&" ], null, this["token"]) && this._rule("bitExpr", false, [], null, this["bitExpr"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", "&&", x, y ]);
    }) || this._atomic(function() {
        return this._rule("bitExpr", false, [], null, this["bitExpr"]);
    });
};

BSJSParser.prototype["bitExpr"] = function $bitExpr() {
    return this._atomic(function() {
        var x, op, y;
        return this._rule("bitExpr", false, [], null, this["bitExpr"]) && (x = this._getIntermediate(), true) && (this._atomic(function() {
            return this._rule("token", true, [ "|" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "^" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "&" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("eqExpr", false, [], null, this["eqExpr"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", op, x, y ]);
    }) || this._atomic(function() {
        return this._rule("eqExpr", false, [], null, this["eqExpr"]);
    });
};

BSJSParser.prototype["eqExpr"] = function $eqExpr() {
    return this._atomic(function() {
        var x, op, y;
        return this._rule("eqExpr", false, [], null, this["eqExpr"]) && (x = this._getIntermediate(), true) && (this._atomic(function() {
            return this._rule("token", true, [ "==" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "!=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "===" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "!==" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("relExpr", false, [], null, this["relExpr"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", op, x, y ]);
    }) || this._atomic(function() {
        return this._rule("relExpr", false, [], null, this["relExpr"]);
    });
};

BSJSParser.prototype["relExpr"] = function $relExpr() {
    return this._atomic(function() {
        var x, op, y;
        return this._rule("relExpr", false, [], null, this["relExpr"]) && (x = this._getIntermediate(), true) && (this._atomic(function() {
            return this._rule("token", true, [ ">" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ ">=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "<" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "<=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "instanceof" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "in" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("shiftExpr", false, [], null, this["shiftExpr"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", op, x, y ]);
    }) || this._atomic(function() {
        return this._rule("shiftExpr", false, [], null, this["shiftExpr"]);
    });
};

BSJSParser.prototype["shiftExpr"] = function $shiftExpr() {
    return this._atomic(function() {
        var op, y;
        return this._rule("shiftExpr", false, [], null, this["shiftExpr"]) && (this._atomic(function() {
            return this._rule("token", true, [ ">>>" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "<<<" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ ">>" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("addExpr", false, [], null, this["addExpr"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", op, x, y ]);
    }) || this._atomic(function() {
        return this._rule("addExpr", false, [], null, this["addExpr"]);
    });
};

BSJSParser.prototype["addExpr"] = function $addExpr() {
    return this._atomic(function() {
        var x, op, y;
        return this._rule("addExpr", false, [], null, this["addExpr"]) && (x = this._getIntermediate(), true) && (this._atomic(function() {
            return this._rule("token", true, [ "+" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "-" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("mulExpr", false, [], null, this["mulExpr"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", op, x, y ]);
    }) || this._atomic(function() {
        return this._rule("mulExpr", false, [], null, this["mulExpr"]);
    });
};

BSJSParser.prototype["mulExpr"] = function $mulExpr() {
    return this._atomic(function() {
        var x, op, y;
        return this._rule("mulExpr", false, [], null, this["mulExpr"]) && (x = this._getIntermediate(), true) && (this._atomic(function() {
            return this._rule("token", true, [ "*" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "/" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "%" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("unary", false, [], null, this["unary"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", op, x, y ]);
    }) || this._atomic(function() {
        return this._rule("unary", false, [], null, this["unary"]);
    });
};

BSJSParser.prototype["unary"] = function $unary() {
    return this._atomic(function() {
        var op, p;
        return (this._atomic(function() {
            return this._rule("token", true, [ "-" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "+" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("postfix", false, [], null, this["postfix"]) && (p = this._getIntermediate(), true) && this._exec([ "unop", op, p ]);
    }) || this._atomic(function() {
        var op, p;
        return (this._atomic(function() {
            return this._rule("token", true, [ "--" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "++" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("postfix", false, [], null, this["postfix"]) && (p = this._getIntermediate(), true) && this._exec([ "preop", op, p ]);
    }) || this._atomic(function() {
        var op, p;
        return (this._atomic(function() {
            return this._rule("token", true, [ "!" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "~" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "void" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "delete" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "typeof" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("unary", false, [], null, this["unary"]) && (p = this._getIntermediate(), true) && this._exec([ "unop", op, p ]);
    }) || this._atomic(function() {
        return this._rule("postfix", false, [], null, this["postfix"]);
    });
};

BSJSParser.prototype["postfix"] = function $postfix() {
    var p;
    return this._rule("primExpr", false, [], null, this["primExpr"]) && (p = this._getIntermediate(), true) && (this._atomic(function() {
        var op;
        return this._rule("spacesNoNl", false, [], null, this["spacesNoNl"]) && (this._atomic(function() {
            return this._rule("token", true, [ "++" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "--" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._exec([ "postop", op, p ]);
    }) || this._atomic(function() {
        return this._rule("empty", false, [], null, this["empty"]) && this._exec(p);
    }));
};

BSJSParser.prototype["dotProp"] = function $dotProp() {
    var p;
    return this._skip() && (p = this._getIntermediate(), true) && (this._atomic(function() {
        var i;
        return this._rule("token", true, [ "[" ], null, this["token"]) && this._rule("expr", false, [], null, this["expr"]) && (i = this._getIntermediate(), true) && this._rule("token", true, [ "]" ], null, this["token"]) && this._exec([ "getp", i, p ]);
    }) || this._atomic(function() {
        var f;
        return this._rule("token", true, [ "." ], null, this["token"]) && this._rule("token", true, [ "name" ], null, this["token"]) && (f = this._getIntermediate(), true) && this._exec([ "getp", [ "string", f ], p ]);
    }) || this._atomic(function() {
        var f;
        return this._rule("token", true, [ "." ], null, this["token"]) && this._rule("spaces", false, [], null, this["spaces"]) && this._rule("iName", true, [], null, this["iName"]) && (f = this._getIntermediate(), true) && this._rule("isKeyword", false, [ f ], null, this["isKeyword"]) && this._exec([ "getp", [ "string", f ], p ]);
    }));
};

BSJSParser.prototype["primExpr"] = function $primExpr() {
    return this._atomic(function() {
        var p;
        return this._rule("primExpr", false, [], null, this["primExpr"]) && (p = this._getIntermediate(), true) && (this._atomic(function() {
            var as;
            return this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("listOf", false, [ "asgnExpr", "," ], null, this["listOf"]) && (as = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._exec([ "call", p ].concat(as));
        }) || this._atomic(function() {
            var m, as;
            return this._rule("token", true, [ "." ], null, this["token"]) && this._rule("token", true, [ "name" ], null, this["token"]) && (m = this._getIntermediate(), true) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("listOf", false, [ "asgnExpr", "," ], null, this["listOf"]) && (as = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._exec([ "send", m, p ].concat(as));
        }) || this._atomic(function() {
            var m, as;
            return this._rule("token", true, [ "." ], null, this["token"]) && this._rule("spaces", false, [], null, this["spaces"]) && this._rule("iName", true, [], null, this["iName"]) && (m = this._getIntermediate(), true) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("listOf", false, [ "asgnExpr", "," ], null, this["listOf"]) && (as = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("isKeyword", false, [ m ], null, this["isKeyword"]) && this._exec([ "send", m, p ].concat(as));
        }) || this._atomic(function() {
            var r;
            return this._rule("dotProp", false, [ p ], null, this["dotProp"]) && (r = this._getIntermediate(), true) && this._exec(r);
        }));
    }) || this._atomic(function() {
        return this._rule("memberExpr", false, [], null, this["memberExpr"]);
    });
};

BSJSParser.prototype["memberExpr"] = function $memberExpr() {
    return this._atomic(function() {
        var p, r;
        return this._rule("memberExpr", false, [], null, this["memberExpr"]) && (p = this._getIntermediate(), true) && this._rule("dotProp", false, [ p ], null, this["dotProp"]) && (r = this._getIntermediate(), true) && this._exec(r);
    }) || this._atomic(function() {
        return this._rule("newExpr", false, [], null, this["newExpr"]);
    });
};

BSJSParser.prototype["newExpr"] = function $newExpr() {
    return this._atomic(function() {
        var n, as;
        return this._rule("token", true, [ "new" ], null, this["token"]) && this._rule("memberExpr", false, [], null, this["memberExpr"]) && (n = this._getIntermediate(), true) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("listOf", false, [ "asgnExpr", "," ], null, this["listOf"]) && (as = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._exec([ "new", n ].concat(as));
    }) || this._atomic(function() {
        var n;
        return this._rule("token", true, [ "new" ], null, this["token"]) && this._rule("memberExpr", false, [], null, this["memberExpr"]) && (n = this._getIntermediate(), true) && this._exec([ "new", n ]);
    }) || this._atomic(function() {
        return this._rule("primExprHd", false, [], null, this["primExprHd"]);
    });
};

BSJSParser.prototype["primExprHd"] = function $primExprHd() {
    return this._atomic(function() {
        var e;
        return this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("expr", false, [], null, this["expr"]) && (e = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._exec(e);
    }) || this._atomic(function() {
        return this._rule("token", true, [ "this" ], null, this["token"]) && this._exec([ "this" ]);
    }) || this._atomic(function() {
        var n;
        return this._rule("token", true, [ "name" ], null, this["token"]) && (n = this._getIntermediate(), true) && this._exec([ "get", n ]);
    }) || this._atomic(function() {
        var n;
        return this._rule("token", true, [ "number" ], null, this["token"]) && (n = this._getIntermediate(), true) && this._exec([ "number", n ]);
    }) || this._atomic(function() {
        var s;
        return this._rule("token", true, [ "string" ], null, this["token"]) && (s = this._getIntermediate(), true) && this._exec([ "string", s ]);
    }) || this._atomic(function() {
        return this._rule("func", false, [ true ], null, this["func"]);
    }) || this._atomic(function() {
        var n, as;
        return this._rule("token", true, [ "new" ], null, this["token"]) && this._rule("token", true, [ "name" ], null, this["token"]) && (n = this._getIntermediate(), true) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("listOf", false, [ "asgnExpr", "," ], null, this["listOf"]) && (as = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._exec([ "new", n ].concat(as));
    }) || this._atomic(function() {
        var n;
        return this._rule("token", true, [ "new" ], null, this["token"]) && this._rule("token", true, [ "name" ], null, this["token"]) && (n = this._getIntermediate(), true) && this._exec([ "new", n ]);
    }) || this._atomic(function() {
        var es;
        return this._rule("token", true, [ "[" ], null, this["token"]) && this._rule("listOf", false, [ "asgnExpr", "," ], null, this["listOf"]) && (es = this._getIntermediate(), true) && this._rule("token", true, [ "]" ], null, this["token"]) && this._exec([ "arr" ].concat(es));
    }) || this._atomic(function() {
        return this._rule("json", false, [], null, this["json"]);
    }) || this._atomic(function() {
        return this._rule("re", false, [], null, this["re"]);
    });
};

BSJSParser.prototype["json"] = function $json() {
    var bs;
    return this._rule("token", true, [ "{" ], null, this["token"]) && this._rule("listOf", false, [ "jsonBinding", "," ], null, this["listOf"]) && (bs = this._getIntermediate(), true) && this._rule("token", true, [ "}" ], null, this["token"]) && this._exec([ "json" ].concat(bs));
};

BSJSParser.prototype["jsonBinding"] = function $jsonBinding() {
    var n, v;
    return this._rule("jsonPropName", false, [], null, this["jsonPropName"]) && (n = this._getIntermediate(), true) && this._rule("token", true, [ ":" ], null, this["token"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (v = this._getIntermediate(), true) && this._exec([ "binding", n, v ]);
};

BSJSParser.prototype["jsonPropName"] = function $jsonPropName() {
    return this._atomic(function() {
        return this._rule("token", true, [ "name" ], null, this["token"]);
    }) || this._atomic(function() {
        return this._rule("token", true, [ "number" ], null, this["token"]);
    }) || this._atomic(function() {
        return this._rule("token", true, [ "string" ], null, this["token"]);
    }) || this._atomic(function() {
        var n;
        return this._rule("spaces", false, [], null, this["spaces"]) && this._rule("iName", true, [], null, this["iName"]) && (n = this._getIntermediate(), true) && this._rule("isKeyword", false, [ n ], null, this["isKeyword"]) && this._exec(n);
    });
};

BSJSParser.prototype["re"] = function $re() {
    var x;
    return this._rule("spaces", false, [], null, this["spaces"]) && this._list(function() {
        return this._match("/") && this._rule("reBody", false, [], null, this["reBody"]) && this._match("/") && this._any(function() {
            return this._atomic(function() {
                return this._rule("reFlag", false, [], null, this["reFlag"]);
            });
        });
    }, true) && (x = this._getIntermediate(), true) && this._exec([ "regExp", x ]);
};

BSJSParser.prototype["reBody"] = function $reBody() {
    return this._rule("re1stChar", false, [], null, this["re1stChar"]) && this._any(function() {
        return this._atomic(function() {
            return this._rule("reChar", false, [], null, this["reChar"]);
        });
    });
};

BSJSParser.prototype["re1stChar"] = function $re1stChar() {
    return this._atomic(function() {
        return !this._atomic(function() {
            return this._match("*") || this._match("\\") || this._match("/") || this._match("[");
        }, true) && this._rule("reNonTerm", false, [], null, this["reNonTerm"]);
    }) || this._atomic(function() {
        return this._rule("escapeChar", false, [], null, this["escapeChar"]);
    }) || this._atomic(function() {
        return this._rule("reClass", false, [], null, this["reClass"]);
    });
};

BSJSParser.prototype["reChar"] = function $reChar() {
    return this._atomic(function() {
        return this._rule("re1stChar", false, [], null, this["re1stChar"]);
    }) || this._match("*");
};

BSJSParser.prototype["reNonTerm"] = function $reNonTerm() {
    return !this._atomic(function() {
        return this._match("\n") || this._match("\r");
    }, true) && this._rule("char", false, [], null, this["char"]);
};

BSJSParser.prototype["reClass"] = function $reClass() {
    return this._match("[") && this._any(function() {
        return this._atomic(function() {
            return this._rule("reClassChar", false, [], null, this["reClassChar"]);
        });
    }) && this._match("]");
};

BSJSParser.prototype["reClassChar"] = function $reClassChar() {
    return !this._atomic(function() {
        return this._match("[") || this._match("]");
    }, true) && this._rule("reChar", false, [], null, this["reChar"]);
};

BSJSParser.prototype["reFlag"] = function $reFlag() {
    return this._rule("nameFirst", false, [], null, this["nameFirst"]);
};

BSJSParser.prototype["formal"] = function $formal() {
    return this._rule("spaces", false, [], null, this["spaces"]) && this._rule("token", true, [ "name" ], null, this["token"]);
};

BSJSParser.prototype["func"] = function $func() {
    var anon, n, fs, body;
    return this._skip() && (anon = this._getIntermediate(), true) && this._rule("token", true, [ "function" ], null, this["token"]) && this._optional(function() {
        return anon && this._rule("token", true, [ "name" ], null, this["token"]);
    }) && (n = this._getIntermediate(), true) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("listOf", false, [ "formal", "," ], null, this["listOf"]) && (fs = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("token", true, [ "{" ], null, this["token"]) && this._rule("srcElems", false, [], null, this["srcElems"]) && (body = this._getIntermediate(), true) && this._rule("token", true, [ "}" ], null, this["token"]) && this._exec([ "func", n || null, fs, body ]);
};

BSJSParser.prototype["sc"] = function $sc() {
    return this._atomic(function() {
        return this._rule("spacesNoNl", false, [], null, this["spacesNoNl"]) && (this._match("\n") || this._atomic(function() {
            return this._atomic(function() {
                return this._match("}");
            }, true);
        }) || this._atomic(function() {
            return this._rule("end", false, [], null, this["end"]);
        }));
    }) || this._atomic(function() {
        return this._rule("token", true, [ ";" ], null, this["token"]);
    });
};

BSJSParser.prototype["binding"] = function $binding() {
    return this._atomic(function() {
        var n, v;
        return this._rule("token", true, [ "name" ], null, this["token"]) && (n = this._getIntermediate(), true) && this._rule("token", true, [ "=" ], null, this["token"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (v = this._getIntermediate(), true) && this._exec([ n, v ]);
    }) || this._atomic(function() {
        var n;
        return this._rule("token", true, [ "name" ], null, this["token"]) && (n = this._getIntermediate(), true) && this._exec([ n ]);
    });
};

BSJSParser.prototype["block"] = function $block() {
    var ss;
    return this._rule("token", true, [ "{" ], null, this["token"]) && this._rule("srcElems", false, [], null, this["srcElems"]) && (ss = this._getIntermediate(), true) && this._rule("token", true, [ "}" ], null, this["token"]) && this._exec(ss);
};

BSJSParser.prototype["vars"] = function $vars() {
    var bs;
    return this._rule("token", true, [ "var" ], null, this["token"]) && this._rule("listOf", false, [ "binding", "," ], null, this["listOf"]) && (bs = this._getIntermediate(), true) && this._exec([ "var" ].concat(bs));
};

BSJSParser.prototype["stmt"] = function $stmt() {
    return this._atomic(function() {
        return this._rule("block", false, [], null, this["block"]);
    }) || this._atomic(function() {
        var bs;
        return this._rule("vars", false, [], null, this["vars"]) && (bs = this._getIntermediate(), true) && this._rule("sc", false, [], null, this["sc"]) && this._exec(bs);
    }) || this._atomic(function() {
        var c, t, f;
        return this._rule("token", true, [ "if" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("expr", false, [], null, this["expr"]) && (c = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]) && (t = this._getIntermediate(), true) && (this._atomic(function() {
            return this._rule("token", true, [ "else" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]);
        }) || this._atomic(function() {
            return this._rule("empty", false, [], null, this["empty"]) && this._exec([ "get", "undefined" ]);
        })) && (f = this._getIntermediate(), true) && this._exec([ "if", c, t, f ]);
    }) || this._atomic(function() {
        var c, s;
        return this._rule("token", true, [ "while" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("expr", false, [], null, this["expr"]) && (c = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]) && (s = this._getIntermediate(), true) && this._exec([ "while", c, s ]);
    }) || this._atomic(function() {
        var s, c;
        return this._rule("token", true, [ "do" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]) && (s = this._getIntermediate(), true) && this._rule("token", true, [ "while" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("expr", false, [], null, this["expr"]) && (c = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("sc", false, [], null, this["sc"]) && this._exec([ "doWhile", s, c ]);
    }) || this._atomic(function() {
        var i, c, u, s;
        return this._rule("token", true, [ "for" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && (this._atomic(function() {
            return this._rule("vars", false, [], null, this["vars"]);
        }) || this._atomic(function() {
            return this._rule("expr", false, [], null, this["expr"]);
        }) || this._atomic(function() {
            return this._rule("empty", false, [], null, this["empty"]) && this._exec([ "get", "undefined" ]);
        })) && (i = this._getIntermediate(), true) && this._rule("token", true, [ ";" ], null, this["token"]) && (this._atomic(function() {
            return this._rule("expr", false, [], null, this["expr"]);
        }) || this._atomic(function() {
            return this._rule("empty", false, [], null, this["empty"]) && this._exec([ "get", "true" ]);
        })) && (c = this._getIntermediate(), true) && this._rule("token", true, [ ";" ], null, this["token"]) && (this._atomic(function() {
            return this._rule("expr", false, [], null, this["expr"]);
        }) || this._atomic(function() {
            return this._rule("empty", false, [], null, this["empty"]) && this._exec([ "get", "undefined" ]);
        })) && (u = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]) && (s = this._getIntermediate(), true) && this._exec([ "for", i, c, u, s ]);
    }) || this._atomic(function() {
        var cond, s;
        return this._rule("token", true, [ "for" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && (this._atomic(function() {
            var b, e;
            return this._rule("token", true, [ "var" ], null, this["token"]) && this._rule("binding", false, [], null, this["binding"]) && (b = this._getIntermediate(), true) && this._rule("token", true, [ "in" ], null, this["token"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (e = this._getIntermediate(), true) && this._exec([ [ "var", b ], e ]);
        }) || this._atomic(function() {
            var e;
            return this._rule("expr", false, [], null, this["expr"]) && (e = this._getIntermediate(), true) && e[0] === "binop" && e[1] === "in" && this._exec(function() {
                return e.slice(2);
            }.call(this));
        })) && (cond = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]) && (s = this._getIntermediate(), true) && this._exec([ "forIn", cond[0], cond[1], s ]);
    }) || this._atomic(function() {
        var e, cs;
        return this._rule("token", true, [ "switch" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("expr", false, [], null, this["expr"]) && (e = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("token", true, [ "{" ], null, this["token"]) && this._any(function() {
            return this._atomic(function() {
                return this._atomic(function() {
                    var c, cs;
                    return this._rule("token", true, [ "case" ], null, this["token"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (c = this._getIntermediate(), true) && this._rule("token", true, [ ":" ], null, this["token"]) && this._rule("srcElems", false, [], null, this["srcElems"]) && (cs = this._getIntermediate(), true) && this._exec([ "case", c, cs ]);
                }) || this._atomic(function() {
                    var cs;
                    return this._rule("token", true, [ "default" ], null, this["token"]) && this._rule("token", true, [ ":" ], null, this["token"]) && this._rule("srcElems", false, [], null, this["srcElems"]) && (cs = this._getIntermediate(), true) && this._exec([ "default", cs ]);
                });
            });
        }) && (cs = this._getIntermediate(), true) && this._rule("token", true, [ "}" ], null, this["token"]) && this._exec([ "switch", e ].concat(cs));
    }) || this._atomic(function() {
        return this._rule("token", true, [ "break" ], null, this["token"]) && this._rule("sc", false, [], null, this["sc"]) && this._exec([ "break" ]);
    }) || this._atomic(function() {
        return this._rule("token", true, [ "continue" ], null, this["token"]) && this._rule("sc", false, [], null, this["sc"]) && this._exec([ "continue" ]);
    }) || this._atomic(function() {
        var e;
        return this._rule("token", true, [ "throw" ], null, this["token"]) && this._rule("spacesNoNl", false, [], null, this["spacesNoNl"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (e = this._getIntermediate(), true) && this._rule("sc", false, [], null, this["sc"]) && this._exec([ "throw", e ]);
    }) || this._atomic(function() {
        var t, e, c, f;
        return this._rule("token", true, [ "try" ], null, this["token"]) && this._rule("block", false, [], null, this["block"]) && (t = this._getIntermediate(), true) && this._rule("token", true, [ "catch" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("token", true, [ "name" ], null, this["token"]) && (e = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("block", false, [], null, this["block"]) && (c = this._getIntermediate(), true) && (this._atomic(function() {
            return this._rule("token", true, [ "finally" ], null, this["token"]) && this._rule("block", false, [], null, this["block"]);
        }) || this._atomic(function() {
            return this._rule("empty", false, [], null, this["empty"]) && this._exec([ "get", "undefined" ]);
        })) && (f = this._getIntermediate(), true) && this._exec([ "try", t, e, c, f ]);
    }) || this._atomic(function() {
        var e;
        return this._rule("token", true, [ "return" ], null, this["token"]) && (this._atomic(function() {
            return this._rule("expr", false, [], null, this["expr"]);
        }) || this._atomic(function() {
            return this._rule("empty", false, [], null, this["empty"]) && this._exec([ "get", "undefined" ]);
        })) && (e = this._getIntermediate(), true) && this._rule("sc", false, [], null, this["sc"]) && this._exec([ "return", e ]);
    }) || this._atomic(function() {
        var x, s;
        return this._rule("token", true, [ "with" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("expr", false, [], null, this["expr"]) && (x = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]) && (s = this._getIntermediate(), true) && this._exec([ "with", x, s ]);
    }) || this._atomic(function() {
        var label, s;
        return this._rule("iName", true, [], null, this["iName"]) && (label = this._getIntermediate(), true) && this._rule("token", true, [ ":" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]) && (s = this._getIntermediate(), true) && this._exec([ "label", label, s ]);
    }) || this._atomic(function() {
        var e;
        return this._rule("expr", false, [], null, this["expr"]) && (e = this._getIntermediate(), true) && this._rule("sc", false, [], null, this["sc"]) && this._exec(e);
    }) || this._atomic(function() {
        return this._rule("token", true, [ ";" ], null, this["token"]) && this._exec([ "get", "undefined" ]);
    });
};

BSJSParser.prototype["srcElem"] = function $srcElem() {
    var s;
    return (this._atomic(function() {
        return this._rule("func", false, [ false ], null, this["func"]);
    }) || this._atomic(function() {
        return this._rule("stmt", false, [], null, this["stmt"]);
    })) && (s = this._getIntermediate(), true) && this._exec([ "stmt", s ]);
};

BSJSParser.prototype["srcElems"] = function $srcElems() {
    var ss;
    return this._any(function() {
        return this._atomic(function() {
            return this._rule("srcElem", false, [], null, this["srcElem"]);
        });
    }) && (ss = this._getIntermediate(), true) && this._exec([ "begin" ].concat(ss));
};

BSJSParser.prototype["topLevel"] = function $topLevel() {
    var r;
    return this._rule("srcElems", false, [], null, this["srcElems"]) && (r = this._getIntermediate(), true) && this._rule("spaces", false, [], null, this["spaces"]) && this._rule("end", false, [], null, this["end"]) && this._exec(r);
};

BSJSParser.hexDigits = "0123456789abcdef";

BSJSParser.keywords = {};

var keywords = [ "break", "case", "catch", "continue", "default", "delete", "do", "else", "finally", "for", "function", "if", "in", "instanceof", "new", "return", "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with", "ometa" ];

for (var idx = 0; idx < keywords.length; idx++) BSJSParser.keywords[keywords[idx]] = true;

BSJSParser._isKeyword = function(k) {
    return BSJSParser.keywords.hasOwnProperty(k);
};

function preparseString(str) {
    return str.replace(/\\x([0-9a-f]{2})/ig, "\\u00$1");
}

var BSJSParser = require("../grammars/BSJSParser");

var BSSemActionParser = function BSSemActionParser(source) {
    BSJSParser.call(this, source);
};

BSSemActionParser.grammarName = "BSSemActionParser";

BSSemActionParser.match = BSJSParser.match;

BSSemActionParser.matchAll = BSJSParser.matchAll;

exports.BSSemActionParser = BSSemActionParser;

require("util").inherits(BSSemActionParser, BSJSParser);

BSSemActionParser.prototype["curlySemAction"] = function $curlySemAction() {
    var s;
    return this._atomic(function() {
        var r;
        return this._rule("token", true, [ "{" ], null, this["token"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (r = this._getIntermediate(), true) && this._rule("sc", false, [], null, this["sc"]) && this._rule("token", true, [ "}" ], null, this["token"]) && this._rule("spaces", false, [], null, this["spaces"]) && this._exec(r);
    }) || this._atomic(function() {
        var ss, s;
        return this._rule("token", true, [ "{" ], null, this["token"]) && this._any(function() {
            return this._atomic(function() {
                return this._rule("srcElem", false, [], null, this["srcElem"]) && (s = this._getIntermediate(), true) && this._atomic(function() {
                    return this._rule("srcElem", false, [], null, this["srcElem"]);
                }, true) && this._exec(s);
            });
        }) && (ss = this._getIntermediate(), true) && (this._atomic(function() {
            var r;
            return this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (r = this._getIntermediate(), true) && this._rule("sc", false, [], null, this["sc"]) && this._exec([ "return", r ]);
        }) || this._atomic(function() {
            return this._rule("srcElem", false, [], null, this["srcElem"]);
        })) && (s = this._getIntermediate(), true) && this._exec(ss.push(s)) && this._rule("token", true, [ "}" ], null, this["token"]) && this._rule("spaces", false, [], null, this["spaces"]) && this._exec([ "send", "call", [ "func", null, [], [ "begin" ].concat(ss) ], [ "this" ] ]);
    });
};

BSSemActionParser.prototype["semAction"] = function $semAction() {
    return this._atomic(function() {
        return this._rule("curlySemAction", false, [], null, this["curlySemAction"]);
    }) || this._atomic(function() {
        var r;
        return this._rule("primExpr", false, [], null, this["primExpr"]) && (r = this._getIntermediate(), true) && this._rule("spaces", false, [], null, this["spaces"]) && this._exec(r);
    });
};

return BSJSParser;
});
