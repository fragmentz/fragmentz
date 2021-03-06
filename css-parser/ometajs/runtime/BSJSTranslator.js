if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function(require,exports,module) {

var AbstractGrammar = require("./grammar");

var BSJSTranslator = function BSJSTranslator(source) {
    AbstractGrammar.call(this, source);
};

BSJSTranslator.grammarName = "BSJSTranslator";

BSJSTranslator.match = AbstractGrammar.match;

BSJSTranslator.matchAll = AbstractGrammar.matchAll;

exports.BSJSTranslator = BSJSTranslator;

require("./util").inherits(BSJSTranslator, AbstractGrammar);

BSJSTranslator.prototype["trans"] = function $trans() {
    var t, ans;
    return this._list(function() {
        return this._skip() && (t = this._getIntermediate(), true) && this._rule("apply", false, [ t ], null, this["apply"]) && (ans = this._getIntermediate(), true);
    }) && this._exec(ans);
};

BSJSTranslator.prototype["curlyTrans"] = function $curlyTrans() {
    return this._atomic(function() {
        var r;
        return this._list(function() {
            return this._match("begin") && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (r = this._getIntermediate(), true);
        }) && this._exec(r);
    }) || this._atomic(function() {
        var rs;
        return this._list(function() {
            return this._match("begin") && this._any(function() {
                return this._atomic(function() {
                    return this._rule("trans", false, [], null, this["trans"]);
                });
            }) && (rs = this._getIntermediate(), true);
        }) && this._exec("{" + rs.join(";") + "}");
    }) || this._atomic(function() {
        var r;
        return this._rule("trans", false, [], null, this["trans"]) && (r = this._getIntermediate(), true) && this._exec("{" + r + "}");
    });
};

BSJSTranslator.prototype["this"] = function $this() {
    return this._exec("this");
};

BSJSTranslator.prototype["break"] = function $break() {
    return this._exec("break");
};

BSJSTranslator.prototype["continue"] = function $continue() {
    return this._exec("continue");
};

BSJSTranslator.prototype["number"] = function $number() {
    var n;
    return this._skip() && (n = this._getIntermediate(), true) && this._exec(n);
};

BSJSTranslator.prototype["string"] = function $string() {
    var s;
    return this._skip() && (s = this._getIntermediate(), true) && this._exec(JSON.stringify(s));
};

BSJSTranslator.prototype["regExp"] = function $regExp() {
    var x;
    return this._skip() && (x = this._getIntermediate(), true) && this._exec(x);
};

BSJSTranslator.prototype["arr"] = function $arr() {
    var $l0, $l1, xs;
    return ($l0 = this, $l1 = $l0.op, $l0.op = "[]", true) && (this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (xs = this._getIntermediate(), true) && this._exec("[" + xs.join(",") + "]") && ($l0.op = $l1, true) || ($l0.op = $l1, false));
};

BSJSTranslator.prototype["unop"] = function $unop() {
    var op, prevOp, $l2, $l3, t;
    return this._skip() && (op = this._getIntermediate(), true) && this._exec(this.op) && (prevOp = this._getIntermediate(), true) && ($l2 = this, $l3 = $l2.op, $l2.op = "u" + op, true) && (this._rule("trans", false, [], null, this["trans"]) && (t = this._getIntermediate(), true) && this._exec(function() {
        var res;
        if (op === "typeof" || op === "void" || op === "delete") {
            res = op + " " + t;
        } else {
            res = op + t;
        }
        if (BSJSTranslator.comparePriorities(prevOp, "u" + op)) {
            res = "(" + res + ")";
        }
        return res;
    }.call(this)) && ($l2.op = $l3, true) || ($l2.op = $l3, false));
};

BSJSTranslator.prototype["getp"] = function $getp() {
    var $l4, $l5, fd, tfd, x;
    return ($l4 = this, $l5 = $l4.op, $l4.op = ".", true) && (this._skip() && (fd = this._getIntermediate(), true) && this._rule("trans", false, [ fd ], null, this["trans"]) && (tfd = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec(function() {
        if (fd[0] === "string" && /^[$_a-z0-9][a-z0-9]*$/i.test(fd[1]) && !BSJSParser._isKeyword(fd[1])) {
            return x + "." + fd[1];
        } else {
            return x + "[" + tfd + "]";
        }
    }.call(this)) && ($l4.op = $l5, true) || ($l4.op = $l5, false));
};

BSJSTranslator.prototype["get"] = function $get() {
    var x;
    return this._skip() && (x = this._getIntermediate(), true) && this._exec(x);
};

BSJSTranslator.prototype["set"] = function $set() {
    var prevOp, lhs, $l6, $l7, rhs;
    return this._exec(this.op) && (prevOp = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (lhs = this._getIntermediate(), true) && ($l6 = this, $l7 = $l6.op, $l6.op = "=", true) && (this._rule("trans", false, [], null, this["trans"]) && (rhs = this._getIntermediate(), true) && this._exec(function() {
        if (BSJSTranslator.comparePriorities(prevOp, "=")) {
            return "(" + lhs + " = " + rhs + ")";
        } else {
            return lhs + " = " + rhs;
        }
    }.call(this)) && ($l6.op = $l7, true) || ($l6.op = $l7, false));
};

BSJSTranslator.prototype["mset"] = function $mset() {
    var prevOp, lhs, op, $l8, $l9, rhs;
    return this._exec(this.op) && (prevOp = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (lhs = this._getIntermediate(), true) && this._skip() && (op = this._getIntermediate(), true) && ($l8 = this, $l9 = $l8.op, $l8.op = op + "=", true) && (this._rule("trans", false, [], null, this["trans"]) && (rhs = this._getIntermediate(), true) && this._exec(function() {
        if (BSJSTranslator.comparePriorities(prevOp, op + "=")) {
            return "(" + lhs + " " + op + "= " + rhs + ")";
        } else {
            return lhs + " " + op + "= " + rhs;
        }
    }.call(this)) && ($l8.op = $l9, true) || ($l8.op = $l9, false));
};

BSJSTranslator.prototype["binop"] = function $binop() {
    var op, prevOp, $l10, $l11, x, y;
    return this._skip() && (op = this._getIntermediate(), true) && this._exec(this.op) && (prevOp = this._getIntermediate(), true) && ($l10 = this, $l11 = $l10.op, $l10.op = op, true) && (this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (y = this._getIntermediate(), true) && this._exec(function() {
        var res = x + " " + op + " " + y;
        if (BSJSTranslator.comparePriorities(prevOp, op)) {
            res = "(" + res + ")";
        }
        return res;
    }.call(this)) && ($l10.op = $l11, true) || ($l10.op = $l11, false));
};

BSJSTranslator.prototype["preop"] = function $preop() {
    var op, prevOp, $l12, $l13, x;
    return this._skip() && (op = this._getIntermediate(), true) && this._exec(this.op) && (prevOp = this._getIntermediate(), true) && ($l12 = this, $l13 = $l12.op, $l12.op = "u" + op, true) && (this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec(function() {
        var res = op + x;
        if (BSJSTranslator.comparePriorities(prevOp, "u" + op)) {
            res = "(" + res + ")";
        }
        return res;
    }.call(this)) && ($l12.op = $l13, true) || ($l12.op = $l13, false));
};

BSJSTranslator.prototype["postop"] = function $postop() {
    var op, prevOp, $l14, $l15, x;
    return this._skip() && (op = this._getIntermediate(), true) && this._exec(this.op) && (prevOp = this._getIntermediate(), true) && ($l14 = this, $l15 = $l14.op, $l14.op = "u" + op, true) && (this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec(function() {
        var res = x + op;
        if (BSJSTranslator.comparePriorities(prevOp, "u" + op)) {
            res = "(" + res + ")";
        }
        return res;
    }.call(this)) && ($l14.op = $l15, true) || ($l14.op = $l15, false));
};

BSJSTranslator.prototype["return"] = function $return() {
    var x;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec("return " + x);
};

BSJSTranslator.prototype["with"] = function $with() {
    var x, s;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (s = this._getIntermediate(), true) && this._exec("with(" + x + ")" + s);
};

BSJSTranslator.prototype["label"] = function $label() {
    var name, s;
    return this._skip() && (name = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (s = this._getIntermediate(), true) && this._exec(";" + name + ":" + s);
};

BSJSTranslator.prototype["if"] = function $if() {
    var cond, t, e;
    return this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (t = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (e = this._getIntermediate(), true) && this._exec("if(" + cond + ")" + t + "else" + e);
};

BSJSTranslator.prototype["condExpr"] = function $condExpr() {
    var prevOp, $l16, $l17, cond, t, e;
    return this._exec(this.op) && (prevOp = this._getIntermediate(), true) && ($l16 = this, $l17 = $l16.op, $l16.op = "?:", true) && (this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (t = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (e = this._getIntermediate(), true) && this._exec(function() {
        var res = cond + "?" + t + ":" + e;
        if (BSJSTranslator.comparePriorities(prevOp, "?:")) {
            res = "(" + res + ")";
        }
        return res;
    }.call(this)) && ($l16.op = $l17, true) || ($l16.op = $l17, false));
};

BSJSTranslator.prototype["while"] = function $while() {
    var cond, body;
    return this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec("while(" + cond + ")" + body);
};

BSJSTranslator.prototype["doWhile"] = function $doWhile() {
    var body, cond;
    return this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._exec("do" + body + "while(" + cond + ")");
};

BSJSTranslator.prototype["for"] = function $for() {
    var init, cond, upd, body;
    return this._rule("trans", false, [], null, this["trans"]) && (init = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (upd = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec("for(" + init + ";" + cond + ";" + upd + ")" + body);
};

BSJSTranslator.prototype["forIn"] = function $forIn() {
    var x, arr, body;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (arr = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec("for(" + x + " in " + arr + ")" + body);
};

BSJSTranslator.prototype["begin"] = function $begin() {
    var x;
    return this._atomic(function() {
        var x;
        return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("end", false, [], null, this["end"]) && this._exec(x);
    }) || this._atomic(function() {
        var xs;
        return this._any(function() {
            return this._atomic(function() {
                return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && (this._atomic(function() {
                    return this._rule("end", false, [], null, this["end"]) && this._exec(x);
                }) || this._atomic(function() {
                    return this._rule("empty", false, [], null, this["empty"]) && this._exec(x + ";");
                }));
            });
        }) && (xs = this._getIntermediate(), true) && this._exec("{" + xs.join("") + "}");
    });
};

BSJSTranslator.prototype["func"] = function $func() {
    var name, args, body;
    return this._skip() && (name = this._getIntermediate(), true) && this._skip() && (args = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec("function " + (name || "") + "(" + args.join(",") + ")" + body);
};

BSJSTranslator.prototype["call"] = function $call() {
    var fn, tfn, args;
    return this._skip() && (fn = this._getIntermediate(), true) && this._rule("trans", false, [ fn ], null, this["trans"]) && (tfn = this._getIntermediate(), true) && this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (args = this._getIntermediate(), true) && this._exec(function() {
        if (fn[1] === null) tfn = "(" + tfn + ")";
        return tfn + "(" + args.join(",") + ")";
    }.call(this));
};

BSJSTranslator.prototype["send"] = function $send() {
    var msg, recv, args;
    return this._skip() && (msg = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (recv = this._getIntermediate(), true) && this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (args = this._getIntermediate(), true) && this._exec(recv + "." + msg + "(" + args.join(",") + ")");
};

BSJSTranslator.prototype["new"] = function $new() {
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
    }) && (args = this._getIntermediate(), true) && this._exec("new " + cls + "(" + args.join(",") + ")");
};

BSJSTranslator.prototype["var"] = function $var() {
    var vs;
    return this._many(function() {
        return this._atomic(function() {
            return this._rule("varItem", false, [], null, this["varItem"]);
        });
    }) && (vs = this._getIntermediate(), true) && this._exec("var " + vs.join(","));
};

BSJSTranslator.prototype["varItem"] = function $varItem() {
    return this._atomic(function() {
        var n, v, tv;
        return this._list(function() {
            return this._skip() && (n = this._getIntermediate(), true) && this._skip() && (v = this._getIntermediate(), true) && this._rule("trans", false, [ v ], null, this["trans"]) && (tv = this._getIntermediate(), true);
        }) && this._exec(function() {
            return n + " = " + (v[0] === "binop" && v[1] === "," ? "(" + tv + ")" : tv);
        }.call(this));
    }) || this._atomic(function() {
        var n;
        return this._list(function() {
            return this._skip() && (n = this._getIntermediate(), true);
        }) && this._exec(n);
    });
};

BSJSTranslator.prototype["throw"] = function $throw() {
    var x;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec("throw " + x);
};

BSJSTranslator.prototype["try"] = function $try() {
    var x, name, c, f;
    return this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (x = this._getIntermediate(), true) && this._skip() && (name = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (c = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (f = this._getIntermediate(), true) && this._exec("try " + x + "catch(" + name + ")" + c + "finally" + f);
};

BSJSTranslator.prototype["json"] = function $json() {
    var props;
    return this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (props = this._getIntermediate(), true) && this._exec("{" + props.join(",") + "}");
};

BSJSTranslator.prototype["binding"] = function $binding() {
    var name, val;
    return this._skip() && (name = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (val = this._getIntermediate(), true) && this._exec(JSON.stringify(name) + ": " + val);
};

BSJSTranslator.prototype["switch"] = function $switch() {
    var x, cases;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (cases = this._getIntermediate(), true) && this._exec("switch(" + x + "){" + cases.join(";") + "}");
};

BSJSTranslator.prototype["case"] = function $case() {
    var x, y;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (y = this._getIntermediate(), true) && this._exec("case " + x + ": " + y);
};

BSJSTranslator.prototype["default"] = function $default() {
    var y;
    return this._rule("trans", false, [], null, this["trans"]) && (y = this._getIntermediate(), true) && this._exec("default: " + y);
};

BSJSTranslator.prototype["stmt"] = function $stmt() {
    var s, t;
    return this._skip() && (s = this._getIntermediate(), true) && this._rule("trans", false, [ s ], null, this["trans"]) && (t = this._getIntermediate(), true) && this._exec(function() {
        if (s[0] === "function" && s[1] === null || s[0] === "json") {
            return "(" + t + ")";
        }
        return t;
    }.call(this));
};

BSJSTranslator.opPriorities = {
    ".": 0,
    "[]": 0,
    "u++": 1,
    "u--": 1,
    "u+": 2,
    "u-": 2,
    "u!": 2,
    "u~": 2,
    utypeof: 2,
    uvoid: 2,
    udelete: 2,
    "*": 3,
    "/": 3,
    "%": 3,
    "+": 4,
    "-": 4,
    "<<": 5,
    "<<<": 5,
    ">>": 5,
    "<": 6,
    "<=": 6,
    ">": 6,
    ">=": 6,
    "==": 7,
    "===": 7,
    "!=": 7,
    "!==": 7,
    "&": 8,
    "^": 9,
    "|": 10,
    "&&": 11,
    "||": 12,
    "?:": 13,
    "=": 14,
    "+=": 14,
    "-=": 14,
    "*=": 14,
    "/=": 14,
    "%=": 14,
    "<<=": 14,
    ">>=": 14,
    ">>>=": 14,
    "&=": 14,
    "^=": 14,
    "|=": 14,
    ",": 15
};

BSJSTranslator.comparePriorities = function(op1, op2) {
    return op1 != undefined && BSJSTranslator.opPriorities[op1] === undefined || BSJSTranslator.opPriorities[op1] < BSJSTranslator.opPriorities[op2];
};

return BSJSTranslator;
});
