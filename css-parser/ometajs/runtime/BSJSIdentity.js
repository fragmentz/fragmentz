if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function(require,exports,module) {

var AbstractGrammar = require("./grammar");

var BSJSIdentity = function BSJSIdentity(source) {
    AbstractGrammar.call(this, source);
};

BSJSIdentity.grammarName = "BSJSIdentity";

BSJSIdentity.match = AbstractGrammar.match;

BSJSIdentity.matchAll = AbstractGrammar.matchAll;

exports.BSJSIdentity = BSJSIdentity;

require("./util").inherits(BSJSIdentity, AbstractGrammar);

BSJSIdentity.prototype["trans"] = function $trans() {
    return this._atomic(function() {
        var t, ans;
        return this._list(function() {
            return this._skip() && (t = this._getIntermediate(), true) && this._rule("apply", false, [ t ], null, this["apply"]) && (ans = this._getIntermediate(), true);
        }) && this._exec(ans);
    }) || this._atomic(function() {
        var t;
        return this._list(function() {
            return this._skip() && (t = this._getIntermediate(), true);
        }) && this._exec(t);
    });
};

BSJSIdentity.prototype["curlyTrans"] = function $curlyTrans() {
    return this._atomic(function() {
        var r;
        return this._list(function() {
            return this._match("begin") && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (r = this._getIntermediate(), true);
        }) && this._exec([ "begin", r ]);
    }) || this._atomic(function() {
        var rs;
        return this._list(function() {
            return this._match("begin") && this._any(function() {
                return this._atomic(function() {
                    return this._rule("trans", false, [], null, this["trans"]);
                });
            }) && (rs = this._getIntermediate(), true);
        }) && this._exec([ "begin" ].concat(rs));
    }) || this._atomic(function() {
        var r;
        return this._rule("trans", false, [], null, this["trans"]) && (r = this._getIntermediate(), true) && this._exec(r);
    });
};

BSJSIdentity.prototype["this"] = function $this() {
    return this._exec([ "this" ]);
};

BSJSIdentity.prototype["break"] = function $break() {
    return this._exec([ "break" ]);
};

BSJSIdentity.prototype["continue"] = function $continue() {
    return this._exec([ "continue" ]);
};

BSJSIdentity.prototype["number"] = function $number() {
    var n;
    return this._skip() && (n = this._getIntermediate(), true) && this._exec([ "number", n ]);
};

BSJSIdentity.prototype["string"] = function $string() {
    var s;
    return this._skip() && (s = this._getIntermediate(), true) && this._exec([ "string", s ]);
};

BSJSIdentity.prototype["regExp"] = function $regExp() {
    var x;
    return this._skip() && (x = this._getIntermediate(), true) && this._exec([ "regExp", x ]);
};

BSJSIdentity.prototype["arr"] = function $arr() {
    var xs;
    return this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (xs = this._getIntermediate(), true) && this._exec([ "arr" ].concat(xs));
};

BSJSIdentity.prototype["unop"] = function $unop() {
    var op, x;
    return this._skip() && (op = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec([ "unop", op, x ]);
};

BSJSIdentity.prototype["get"] = function $get() {
    var x;
    return this._skip() && (x = this._getIntermediate(), true) && this._exec([ "get", x ]);
};

BSJSIdentity.prototype["getp"] = function $getp() {
    var fd, x;
    return this._rule("trans", false, [], null, this["trans"]) && (fd = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec([ "getp", fd, x ]);
};

BSJSIdentity.prototype["set"] = function $set() {
    var lhs, rhs;
    return this._rule("trans", false, [], null, this["trans"]) && (lhs = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (rhs = this._getIntermediate(), true) && this._exec([ "set", lhs, rhs ]);
};

BSJSIdentity.prototype["mset"] = function $mset() {
    var lhs, op, rhs;
    return this._rule("trans", false, [], null, this["trans"]) && (lhs = this._getIntermediate(), true) && this._skip() && (op = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (rhs = this._getIntermediate(), true) && this._exec([ "mset", lhs, op, rhs ]);
};

BSJSIdentity.prototype["binop"] = function $binop() {
    var op, x, y;
    return this._skip() && (op = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", op, x, y ]);
};

BSJSIdentity.prototype["preop"] = function $preop() {
    var op, x;
    return this._skip() && (op = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec([ "preop", op, x ]);
};

BSJSIdentity.prototype["postop"] = function $postop() {
    var op, x;
    return this._skip() && (op = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec([ "postop", op, x ]);
};

BSJSIdentity.prototype["return"] = function $return() {
    var x;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec([ "return", x ]);
};

BSJSIdentity.prototype["with"] = function $with() {
    var x, s;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (s = this._getIntermediate(), true) && this._exec([ "with", x, s ]);
};

BSJSIdentity.prototype["label"] = function $label() {
    var name, body;
    return this._skip() && (name = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (body = this._getIntermediate(), true) && this._exec([ "label", name, body ]);
};

BSJSIdentity.prototype["if"] = function $if() {
    var cond, t, e;
    return this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (t = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (e = this._getIntermediate(), true) && this._exec([ "if", cond, t, e ]);
};

BSJSIdentity.prototype["condExpr"] = function $condExpr() {
    var cond, t, e;
    return this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (t = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (e = this._getIntermediate(), true) && this._exec([ "condExpr", cond, t, e ]);
};

BSJSIdentity.prototype["while"] = function $while() {
    var cond, body;
    return this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec([ "while", cond, body ]);
};

BSJSIdentity.prototype["doWhile"] = function $doWhile() {
    var body, cond;
    return this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._exec([ "doWhile", body, cond ]);
};

BSJSIdentity.prototype["for"] = function $for() {
    var init, cond, upd, body;
    return this._rule("trans", false, [], null, this["trans"]) && (init = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (upd = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec([ "for", init, cond, upd, body ]);
};

BSJSIdentity.prototype["forIn"] = function $forIn() {
    var x, arr, body;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (arr = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec([ "forIn", x, arr, body ]);
};

BSJSIdentity.prototype["begin"] = function $begin() {
    return this._atomic(function() {
        var x;
        return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("end", false, [], null, this["end"]) && this._exec([ "begin", x ]);
    }) || this._atomic(function() {
        var xs;
        return this._any(function() {
            return this._atomic(function() {
                return this._rule("trans", false, [], null, this["trans"]);
            });
        }) && (xs = this._getIntermediate(), true) && this._exec([ "begin" ].concat(xs));
    });
};

BSJSIdentity.prototype["func"] = function $func() {
    var name, args, body;
    return this._skip() && (name = this._getIntermediate(), true) && this._skip() && (args = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec([ "func", name, args, body ]);
};

BSJSIdentity.prototype["call"] = function $call() {
    var fn, args;
    return this._rule("trans", false, [], null, this["trans"]) && (fn = this._getIntermediate(), true) && this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (args = this._getIntermediate(), true) && this._exec([ "call", fn ].concat(args));
};

BSJSIdentity.prototype["send"] = function $send() {
    var msg, recv, args;
    return this._skip() && (msg = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (recv = this._getIntermediate(), true) && this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (args = this._getIntermediate(), true) && this._exec([ "send", msg, recv ].concat(args));
};

BSJSIdentity.prototype["new"] = function $new() {
    var cls, args;
    return (this._atomic(function() {
        var str;
        return this._skip() && (str = this._getIntermediate(), true) && typeof str === "string" && this._exec(str);
    }) || this._atomic(function() {
        return this._rule("trans", false, [], null, this["trans"]);
    })) && (cls = this._getIntermediate(), true) && this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (args = this._getIntermediate(), true) && this._exec([ "new", cls ].concat(args));
};

BSJSIdentity.prototype["var"] = function $var() {
    var vs;
    return this._many(function() {
        return this._atomic(function() {
            return this._rule("varItem", false, [], null, this["varItem"]);
        });
    }) && (vs = this._getIntermediate(), true) && this._exec([ "var" ].concat(vs));
};

BSJSIdentity.prototype["varItem"] = function $varItem() {
    return this._atomic(function() {
        var n, v;
        return this._list(function() {
            return this._skip() && (n = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (v = this._getIntermediate(), true);
        }) && this._exec([ n, v ]);
    }) || this._atomic(function() {
        var n;
        return this._list(function() {
            return this._skip() && (n = this._getIntermediate(), true);
        }) && this._exec([ n ]);
    });
};

BSJSIdentity.prototype["throw"] = function $throw() {
    var x;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec([ "throw", x ]);
};

BSJSIdentity.prototype["try"] = function $try() {
    var x, name, c, f;
    return this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (x = this._getIntermediate(), true) && this._skip() && (name = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (c = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (f = this._getIntermediate(), true) && this._exec([ "try", x, name, c, f ]);
};

BSJSIdentity.prototype["json"] = function $json() {
    var props;
    return this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (props = this._getIntermediate(), true) && this._exec([ "json" ].concat(props));
};

BSJSIdentity.prototype["binding"] = function $binding() {
    var name, val;
    return this._skip() && (name = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (val = this._getIntermediate(), true) && this._exec([ "binding", name, val ]);
};

BSJSIdentity.prototype["switch"] = function $switch() {
    var x, cases;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (cases = this._getIntermediate(), true) && this._exec([ "switch", x ].concat(cases));
};

BSJSIdentity.prototype["case"] = function $case() {
    var x, y;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (y = this._getIntermediate(), true) && this._exec([ "case", x, y ]);
};

BSJSIdentity.prototype["stmt"] = function $stmt() {
    var s;
    return this._rule("trans", false, [], null, this["trans"]) && (s = this._getIntermediate(), true) && this._exec([ "stmt", s ]);
};

BSJSIdentity.prototype["default"] = function $default() {
    var y;
    return this._rule("trans", false, [], null, this["trans"]) && (y = this._getIntermediate(), true) && this._exec([ "default", y ]);
};

});
