/*! For license information please see app.js.LICENSE.txt */
(() => {
    var t = {
            "./node_modules/animejs/lib/anime.es.js": (t, e, n) => {
                "use strict";
                n.r(e), n.d(e, {
                    default: () => rt
                });
                var r = {
                        update: null,
                        begin: null,
                        loopBegin: null,
                        changeBegin: null,
                        change: null,
                        changeComplete: null,
                        loopComplete: null,
                        complete: null,
                        loop: 1,
                        direction: "normal",
                        autoplay: !0,
                        timelineOffset: 0
                    },
                    o = {
                        duration: 1e3,
                        delay: 0,
                        endDelay: 0,
                        easing: "easeOutElastic(1, .5)",
                        round: 0
                    },
                    i = ["translateX", "translateY", "translateZ", "rotate", "rotateX", "rotateY", "rotateZ", "scale", "scaleX", "scaleY", "scaleZ", "skew", "skewX", "skewY", "perspective", "matrix", "matrix3d"],
                    a = {
                        CSS: {},
                        springs: {}
                    };

                function s(t, e, n) {
                    return Math.min(Math.max(t, e), n)
                }

                function u(t, e) {
                    return t.indexOf(e) > -1
                }

                function c(t, e) {
                    return t.apply(null, e)
                }
                var l = {
                    arr: function(t) {
                        return Array.isArray(t)
                    },
                    obj: function(t) {
                        return u(Object.prototype.toString.call(t), "Object")
                    },
                    pth: function(t) {
                        return l.obj(t) && t.hasOwnProperty("totalLength")
                    },
                    svg: function(t) {
                        return t instanceof SVGElement
                    },
                    inp: function(t) {
                        return t instanceof HTMLInputElement
                    },
                    dom: function(t) {
                        return t.nodeType || l.svg(t)
                    },
                    str: function(t) {
                        return "string" == typeof t
                    },
                    fnc: function(t) {
                        return "function" == typeof t
                    },
                    und: function(t) {
                        return void 0 === t
                    },
                    nil: function(t) {
                        return l.und(t) || null === t
                    },
                    hex: function(t) {
                        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(t)
                    },
                    rgb: function(t) {
                        return /^rgb/.test(t)
                    },
                    hsl: function(t) {
                        return /^hsl/.test(t)
                    },
                    col: function(t) {
                        return l.hex(t) || l.rgb(t) || l.hsl(t)
                    },
                    key: function(t) {
                        return !r.hasOwnProperty(t) && !o.hasOwnProperty(t) && "targets" !== t && "keyframes" !== t
                    }
                };

                function f(t) {
                    var e = /\(([^)]+)\)/.exec(t);
                    return e ? e[1].split(",").map((function(t) {
                        return parseFloat(t)
                    })) : []
                }

                function h(t, e) {
                    var n = f(t),
                        r = s(l.und(n[0]) ? 1 : n[0], .1, 100),
                        o = s(l.und(n[1]) ? 100 : n[1], .1, 100),
                        i = s(l.und(n[2]) ? 10 : n[2], .1, 100),
                        u = s(l.und(n[3]) ? 0 : n[3], .1, 100),
                        c = Math.sqrt(o / r),
                        h = i / (2 * Math.sqrt(o * r)),
                        d = h < 1 ? c * Math.sqrt(1 - h * h) : 0,
                        p = h < 1 ? (h * c - u) / d : -u + c;

                    function g(t) {
                        var n = e ? e * t / 1e3 : t;
                        return n = h < 1 ? Math.exp(-n * h * c) * (1 * Math.cos(d * n) + p * Math.sin(d * n)) : (1 + p * n) * Math.exp(-n * c), 0 === t || 1 === t ? t : 1 - n
                    }
                    return e ? g : function() {
                        var e = a.springs[t];
                        if (e) return e;
                        for (var n = 1 / 6, r = 0, o = 0;;)
                            if (1 === g(r += n)) {
                                if (++o >= 16) break
                            } else o = 0;
                        var i = r * n * 1e3;
                        return a.springs[t] = i, i
                    }
                }

                function d(t) {
                    return void 0 === t && (t = 10),
                        function(e) {
                            return Math.ceil(s(e, 1e-6, 1) * t) * (1 / t)
                        }
                }
                var p, g, m = function() {
                        var t = .1;

                        function e(t, e) {
                            return 1 - 3 * e + 3 * t
                        }

                        function n(t, e) {
                            return 3 * e - 6 * t
                        }

                        function r(t) {
                            return 3 * t
                        }

                        function o(t, o, i) {
                            return ((e(o, i) * t + n(o, i)) * t + r(o)) * t
                        }

                        function i(t, o, i) {
                            return 3 * e(o, i) * t * t + 2 * n(o, i) * t + r(o)
                        }
                        return function(e, n, r, a) {
                            if (0 <= e && e <= 1 && 0 <= r && r <= 1) {
                                var s = new Float32Array(11);
                                if (e !== n || r !== a)
                                    for (var u = 0; u < 11; ++u) s[u] = o(u * t, e, r);
                                return function(u) {
                                    return e === n && r === a || 0 === u || 1 === u ? u : o(function(n) {
                                        for (var a = 0, u = 1; 10 !== u && s[u] <= n; ++u) a += t;
                                        --u;
                                        var c = a + (n - s[u]) / (s[u + 1] - s[u]) * t,
                                            l = i(c, e, r);
                                        return l >= .001 ? function(t, e, n, r) {
                                            for (var a = 0; a < 4; ++a) {
                                                var s = i(e, n, r);
                                                if (0 === s) return e;
                                                e -= (o(e, n, r) - t) / s
                                            }
                                            return e
                                        }(n, c, e, r) : 0 === l ? c : function(t, e, n, r, i) {
                                            var a, s, u = 0;
                                            do {
                                                (a = o(s = e + (n - e) / 2, r, i) - t) > 0 ? n = s : e = s
                                            } while (Math.abs(a) > 1e-7 && ++u < 10);
                                            return s
                                        }(n, a, a + t, e, r)
                                    }(u), n, a)
                                }
                            }
                        }
                    }(),
                    v = (p = {
                        linear: function() {
                            return function(t) {
                                return t
                            }
                        }
                    }, g = {
                        Sine: function() {
                            return function(t) {
                                return 1 - Math.cos(t * Math.PI / 2)
                            }
                        },
                        Circ: function() {
                            return function(t) {
                                return 1 - Math.sqrt(1 - t * t)
                            }
                        },
                        Back: function() {
                            return function(t) {
                                return t * t * (3 * t - 2)
                            }
                        },
                        Bounce: function() {
                            return function(t) {
                                for (var e, n = 4; t < ((e = Math.pow(2, --n)) - 1) / 11;);
                                return 1 / Math.pow(4, 3 - n) - 7.5625 * Math.pow((3 * e - 2) / 22 - t, 2)
                            }
                        },
                        Elastic: function(t, e) {
                            void 0 === t && (t = 1), void 0 === e && (e = .5);
                            var n = s(t, 1, 10),
                                r = s(e, .1, 2);
                            return function(t) {
                                return 0 === t || 1 === t ? t : -n * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - r / (2 * Math.PI) * Math.asin(1 / n)) * (2 * Math.PI) / r)
                            }
                        }
                    }, ["Quad", "Cubic", "Quart", "Quint", "Expo"].forEach((function(t, e) {
                        g[t] = function() {
                            return function(t) {
                                return Math.pow(t, e + 2)
                            }
                        }
                    })), Object.keys(g).forEach((function(t) {
                        var e = g[t];
                        p["easeIn" + t] = e, p["easeOut" + t] = function(t, n) {
                            return function(r) {
                                return 1 - e(t, n)(1 - r)
                            }
                        }, p["easeInOut" + t] = function(t, n) {
                            return function(r) {
                                return r < .5 ? e(t, n)(2 * r) / 2 : 1 - e(t, n)(-2 * r + 2) / 2
                            }
                        }, p["easeOutIn" + t] = function(t, n) {
                            return function(r) {
                                return r < .5 ? (1 - e(t, n)(1 - 2 * r)) / 2 : (e(t, n)(2 * r - 1) + 1) / 2
                            }
                        }
                    })), p);

                function y(t, e) {
                    if (l.fnc(t)) return t;
                    var n = t.split("(")[0],
                        r = v[n],
                        o = f(t);
                    switch (n) {
                        case "spring":
                            return h(t, e);
                        case "cubicBezier":
                            return c(m, o);
                        case "steps":
                            return c(d, o);
                        default:
                            return c(r, o)
                    }
                }

                function b(t) {
                    try {
                        return document.querySelectorAll(t)
                    } catch (t) {
                        return
                    }
                }

                function w(t, e) {
                    for (var n = t.length, r = arguments.length >= 2 ? arguments[1] : void 0, o = [], i = 0; i < n; i++)
                        if (i in t) {
                            var a = t[i];
                            e.call(r, a, i, t) && o.push(a)
                        }
                    return o
                }

                function _(t) {
                    return t.reduce((function(t, e) {
                        return t.concat(l.arr(e) ? _(e) : e)
                    }), [])
                }

                function I(t) {
                    return l.arr(t) ? t : (l.str(t) && (t = b(t) || t), t instanceof NodeList || t instanceof HTMLCollection ? [].slice.call(t) : [t])
                }

                function M(t, e) {
                    return t.some((function(t) {
                        return t === e
                    }))
                }

                function x(t) {
                    var e = {};
                    for (var n in t) e[n] = t[n];
                    return e
                }

                function T(t, e) {
                    var n = x(t);
                    for (var r in t) n[r] = e.hasOwnProperty(r) ? e[r] : t[r];
                    return n
                }

                function E(t, e) {
                    var n = x(t);
                    for (var r in e) n[r] = l.und(t[r]) ? e[r] : t[r];
                    return n
                }

                function O(t) {
                    var e = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(t);
                    if (e) return e[1]
                }

                function j(t, e) {
                    return l.fnc(t) ? t(e.target, e.id, e.total) : t
                }

                function C(t, e) {
                    return t.getAttribute(e)
                }

                function D(t, e, n) {
                    if (M([n, "deg", "rad", "turn"], O(e))) return e;
                    var r = a.CSS[e + n];
                    if (!l.und(r)) return r;
                    var o = document.createElement(t.tagName),
                        i = t.parentNode && t.parentNode !== document ? t.parentNode : document.body;
                    i.appendChild(o), o.style.position = "absolute", o.style.width = 100 + n;
                    var s = 100 / o.offsetWidth;
                    i.removeChild(o);
                    var u = s * parseFloat(e);
                    return a.CSS[e + n] = u, u
                }

                function R(t, e, n) {
                    if (e in t.style) {
                        var r = e.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
                            o = t.style[e] || getComputedStyle(t).getPropertyValue(r) || "0";
                        return n ? D(t, o, n) : o
                    }
                }

                function k(t, e) {
                    return l.dom(t) && !l.inp(t) && (!l.nil(C(t, e)) || l.svg(t) && t[e]) ? "attribute" : l.dom(t) && M(i, e) ? "transform" : l.dom(t) && "transform" !== e && R(t, e) ? "css" : null != t[e] ? "object" : void 0
                }

                function A(t) {
                    if (l.dom(t)) {
                        for (var e, n = t.style.transform || "", r = /(\w+)\(([^)]*)\)/g, o = new Map; e = r.exec(n);) o.set(e[1], e[2]);
                        return o
                    }
                }

                function L(t, e, n, r) {
                    switch (k(t, e)) {
                        case "transform":
                            return function(t, e, n, r) {
                                var o = u(e, "scale") ? 1 : 0 + function(t) {
                                        return u(t, "translate") || "perspective" === t ? "px" : u(t, "rotate") || u(t, "skew") ? "deg" : void 0
                                    }(e),
                                    i = A(t).get(e) || o;
                                return n && (n.transforms.list.set(e, i), n.transforms.last = e), r ? D(t, i, r) : i
                            }(t, e, r, n);
                        case "css":
                            return R(t, e, n);
                        case "attribute":
                            return C(t, e);
                        default:
                            return t[e] || 0
                    }
                }

                function S(t, e) {
                    var n = /^(\*=|\+=|-=)/.exec(t);
                    if (!n) return t;
                    var r = O(t) || 0,
                        o = parseFloat(e),
                        i = parseFloat(t.replace(n[0], ""));
                    switch (n[0][0]) {
                        case "+":
                            return o + i + r;
                        case "-":
                            return o - i + r;
                        case "*":
                            return o * i + r
                    }
                }

                function P(t, e) {
                    if (l.col(t)) return function(t) {
                        return l.rgb(t) ? (n = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(e = t)) ? "rgba(" + n[1] + ",1)" : e : l.hex(t) ? function(t) {
                            var e = t.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (function(t, e, n, r) {
                                    return e + e + n + n + r + r
                                })),
                                n = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);
                            return "rgba(" + parseInt(n[1], 16) + "," + parseInt(n[2], 16) + "," + parseInt(n[3], 16) + ",1)"
                        }(t) : l.hsl(t) ? function(t) {
                            var e, n, r, o = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(t) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(t),
                                i = parseInt(o[1], 10) / 360,
                                a = parseInt(o[2], 10) / 100,
                                s = parseInt(o[3], 10) / 100,
                                u = o[4] || 1;

                            function c(t, e, n) {
                                return n < 0 && (n += 1), n > 1 && (n -= 1), n < 1 / 6 ? t + 6 * (e - t) * n : n < .5 ? e : n < 2 / 3 ? t + (e - t) * (2 / 3 - n) * 6 : t
                            }
                            if (0 == a) e = n = r = s;
                            else {
                                var l = s < .5 ? s * (1 + a) : s + a - s * a,
                                    f = 2 * s - l;
                                e = c(f, l, i + 1 / 3), n = c(f, l, i), r = c(f, l, i - 1 / 3)
                            }
                            return "rgba(" + 255 * e + "," + 255 * n + "," + 255 * r + "," + u + ")"
                        }(t) : void 0;
                        var e, n
                    }(t);
                    if (/\s/g.test(t)) return t;
                    var n = O(t),
                        r = n ? t.substr(0, t.length - n.length) : t;
                    return e ? r + e : r
                }

                function B(t, e) {
                    return Math.sqrt(Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2))
                }

                function N(t) {
                    for (var e, n = t.points, r = 0, o = 0; o < n.numberOfItems; o++) {
                        var i = n.getItem(o);
                        o > 0 && (r += B(e, i)), e = i
                    }
                    return r
                }

                function F(t) {
                    if (t.getTotalLength) return t.getTotalLength();
                    switch (t.tagName.toLowerCase()) {
                        case "circle":
                            return function(t) {
                                return 2 * Math.PI * C(t, "r")
                            }(t);
                        case "rect":
                            return function(t) {
                                return 2 * C(t, "width") + 2 * C(t, "height")
                            }(t);
                        case "line":
                            return function(t) {
                                return B({
                                    x: C(t, "x1"),
                                    y: C(t, "y1")
                                }, {
                                    x: C(t, "x2"),
                                    y: C(t, "y2")
                                })
                            }(t);
                        case "polyline":
                            return N(t);
                        case "polygon":
                            return function(t) {
                                var e = t.points;
                                return N(t) + B(e.getItem(e.numberOfItems - 1), e.getItem(0))
                            }(t)
                    }
                }

                function q(t, e) {
                    var n = e || {},
                        r = n.el || function(t) {
                            for (var e = t.parentNode; l.svg(e) && l.svg(e.parentNode);) e = e.parentNode;
                            return e
                        }(t),
                        o = r.getBoundingClientRect(),
                        i = C(r, "viewBox"),
                        a = o.width,
                        s = o.height,
                        u = n.viewBox || (i ? i.split(" ") : [0, 0, a, s]);
                    return {
                        el: r,
                        viewBox: u,
                        x: u[0] / 1,
                        y: u[1] / 1,
                        w: a,
                        h: s,
                        vW: u[2],
                        vH: u[3]
                    }
                }

                function V(t, e, n) {
                    function r(n) {
                        void 0 === n && (n = 0);
                        var r = e + n >= 1 ? e + n : 0;
                        return t.el.getPointAtLength(r)
                    }
                    var o = q(t.el, t.svg),
                        i = r(),
                        a = r(-1),
                        s = r(1),
                        u = n ? 1 : o.w / o.vW,
                        c = n ? 1 : o.h / o.vH;
                    switch (t.property) {
                        case "x":
                            return (i.x - o.x) * u;
                        case "y":
                            return (i.y - o.y) * c;
                        case "angle":
                            return 180 * Math.atan2(s.y - a.y, s.x - a.x) / Math.PI
                    }
                }

                function $(t, e) {
                    var n = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
                        r = P(l.pth(t) ? t.totalLength : t, e) + "";
                    return {
                        original: r,
                        numbers: r.match(n) ? r.match(n).map(Number) : [0],
                        strings: l.str(t) || e ? r.split(n) : []
                    }
                }

                function H(t) {
                    return w(t ? _(l.arr(t) ? t.map(I) : I(t)) : [], (function(t, e, n) {
                        return n.indexOf(t) === e
                    }))
                }

                function U(t) {
                    var e = H(t);
                    return e.map((function(t, n) {
                        return {
                            target: t,
                            id: n,
                            total: e.length,
                            transforms: {
                                list: A(t)
                            }
                        }
                    }))
                }

                function W(t, e) {
                    var n = x(e);
                    if (/^spring/.test(n.easing) && (n.duration = h(n.easing)), l.arr(t)) {
                        var r = t.length;
                        2 !== r || l.obj(t[0]) ? l.fnc(e.duration) || (n.duration = e.duration / r) : t = {
                            value: t
                        }
                    }
                    var o = l.arr(t) ? t : [t];
                    return o.map((function(t, n) {
                        var r = l.obj(t) && !l.pth(t) ? t : {
                            value: t
                        };
                        return l.und(r.delay) && (r.delay = n ? 0 : e.delay), l.und(r.endDelay) && (r.endDelay = n === o.length - 1 ? e.endDelay : 0), r
                    })).map((function(t) {
                        return E(t, n)
                    }))
                }
                var Y = {
                    css: function(t, e, n) {
                        return t.style[e] = n
                    },
                    attribute: function(t, e, n) {
                        return t.setAttribute(e, n)
                    },
                    object: function(t, e, n) {
                        return t[e] = n
                    },
                    transform: function(t, e, n, r, o) {
                        if (r.list.set(e, n), e === r.last || o) {
                            var i = "";
                            r.list.forEach((function(t, e) {
                                i += e + "(" + t + ") "
                            })), t.style.transform = i
                        }
                    }
                };

                function z(t, e) {
                    U(t).forEach((function(t) {
                        for (var n in e) {
                            var r = j(e[n], t),
                                o = t.target,
                                i = O(r),
                                a = L(o, n, i, t),
                                s = S(P(r, i || O(a)), a),
                                u = k(o, n);
                            Y[u](o, n, s, t.transforms, !0)
                        }
                    }))
                }

                function X(t, e) {
                    return w(_(t.map((function(t) {
                        return e.map((function(e) {
                            return function(t, e) {
                                var n = k(t.target, e.name);
                                if (n) {
                                    var r = function(t, e) {
                                            var n;
                                            return t.tweens.map((function(r) {
                                                var o = function(t, e) {
                                                        var n = {};
                                                        for (var r in t) {
                                                            var o = j(t[r], e);
                                                            l.arr(o) && 1 === (o = o.map((function(t) {
                                                                return j(t, e)
                                                            }))).length && (o = o[0]), n[r] = o
                                                        }
                                                        return n.duration = parseFloat(n.duration), n.delay = parseFloat(n.delay), n
                                                    }(r, e),
                                                    i = o.value,
                                                    a = l.arr(i) ? i[1] : i,
                                                    s = O(a),
                                                    u = L(e.target, t.name, s, e),
                                                    c = n ? n.to.original : u,
                                                    f = l.arr(i) ? i[0] : c,
                                                    h = O(f) || O(u),
                                                    d = s || h;
                                                return l.und(a) && (a = c), o.from = $(f, d), o.to = $(S(a, f), d), o.start = n ? n.end : 0, o.end = o.start + o.delay + o.duration + o.endDelay, o.easing = y(o.easing, o.duration), o.isPath = l.pth(i), o.isPathTargetInsideSVG = o.isPath && l.svg(e.target), o.isColor = l.col(o.from.original), o.isColor && (o.round = 1), n = o, o
                                            }))
                                        }(e, t),
                                        o = r[r.length - 1];
                                    return {
                                        type: n,
                                        property: e.name,
                                        animatable: t,
                                        tweens: r,
                                        duration: o.end,
                                        delay: r[0].delay,
                                        endDelay: o.endDelay
                                    }
                                }
                            }(t, e)
                        }))
                    }))), (function(t) {
                        return !l.und(t)
                    }))
                }

                function Z(t, e) {
                    var n = t.length,
                        r = function(t) {
                            return t.timelineOffset ? t.timelineOffset : 0
                        },
                        o = {};
                    return o.duration = n ? Math.max.apply(Math, t.map((function(t) {
                        return r(t) + t.duration
                    }))) : e.duration, o.delay = n ? Math.min.apply(Math, t.map((function(t) {
                        return r(t) + t.delay
                    }))) : e.delay, o.endDelay = n ? o.duration - Math.max.apply(Math, t.map((function(t) {
                        return r(t) + t.duration - t.endDelay
                    }))) : e.endDelay, o
                }
                var G = 0,
                    Q = [],
                    J = function() {
                        var t;

                        function e(n) {
                            for (var r = Q.length, o = 0; o < r;) {
                                var i = Q[o];
                                i.paused ? (Q.splice(o, 1), r--) : (i.tick(n), o++)
                            }
                            t = o > 0 ? requestAnimationFrame(e) : void 0
                        }
                        return "undefined" != typeof document && document.addEventListener("visibilitychange", (function() {
                                tt.suspendWhenDocumentHidden && (K() ? t = cancelAnimationFrame(t) : (Q.forEach((function(t) {
                                    return t._onDocumentVisibility()
                                })), J()))
                            })),
                            function() {
                                t || K() && tt.suspendWhenDocumentHidden || !(Q.length > 0) || (t = requestAnimationFrame(e))
                            }
                    }();

                function K() {
                    return !!document && document.hidden
                }

                function tt(t) {
                    void 0 === t && (t = {});
                    var e, n = 0,
                        i = 0,
                        a = 0,
                        u = 0,
                        c = null;

                    function f(t) {
                        var e = window.Promise && new Promise((function(t) {
                            return c = t
                        }));
                        return t.finished = e, e
                    }
                    var h = function(t) {
                        var e = T(r, t),
                            n = T(o, t),
                            i = function(t, e) {
                                var n = [],
                                    r = e.keyframes;
                                for (var o in r && (e = E(function(t) {
                                        for (var e = w(_(t.map((function(t) {
                                                return Object.keys(t)
                                            }))), (function(t) {
                                                return l.key(t)
                                            })).reduce((function(t, e) {
                                                return t.indexOf(e) < 0 && t.push(e), t
                                            }), []), n = {}, r = function(r) {
                                                var o = e[r];
                                                n[o] = t.map((function(t) {
                                                    var e = {};
                                                    for (var n in t) l.key(n) ? n == o && (e.value = t[n]) : e[n] = t[n];
                                                    return e
                                                }))
                                            }, o = 0; o < e.length; o++) r(o);
                                        return n
                                    }(r), e)), e) l.key(o) && n.push({
                                    name: o,
                                    tweens: W(e[o], t)
                                });
                                return n
                            }(n, t),
                            a = U(t.targets),
                            s = X(a, i),
                            u = Z(s, n),
                            c = G;
                        return G++, E(e, {
                            id: c,
                            children: [],
                            animatables: a,
                            animations: s,
                            duration: u.duration,
                            delay: u.delay,
                            endDelay: u.endDelay
                        })
                    }(t);

                    function d() {
                        var t = h.direction;
                        "alternate" !== t && (h.direction = "normal" !== t ? "normal" : "reverse"), h.reversed = !h.reversed, e.forEach((function(t) {
                            return t.reversed = h.reversed
                        }))
                    }

                    function p(t) {
                        return h.reversed ? h.duration - t : t
                    }

                    function g() {
                        n = 0, i = p(h.currentTime) * (1 / tt.speed)
                    }

                    function m(t, e) {
                        e && e.seek(t - e.timelineOffset)
                    }

                    function v(t) {
                        for (var e = 0, n = h.animations, r = n.length; e < r;) {
                            var o = n[e],
                                i = o.animatable,
                                a = o.tweens,
                                u = a.length - 1,
                                c = a[u];
                            u && (c = w(a, (function(e) {
                                return t < e.end
                            }))[0] || c);
                            for (var l = s(t - c.start - c.delay, 0, c.duration) / c.duration, f = isNaN(l) ? 1 : c.easing(l), d = c.to.strings, p = c.round, g = [], m = c.to.numbers.length, v = void 0, y = 0; y < m; y++) {
                                var b = void 0,
                                    _ = c.to.numbers[y],
                                    I = c.from.numbers[y] || 0;
                                b = c.isPath ? V(c.value, f * _, c.isPathTargetInsideSVG) : I + f * (_ - I), p && (c.isColor && y > 2 || (b = Math.round(b * p) / p)), g.push(b)
                            }
                            var M = d.length;
                            if (M) {
                                v = d[0];
                                for (var x = 0; x < M; x++) {
                                    d[x];
                                    var T = d[x + 1],
                                        E = g[x];
                                    isNaN(E) || (v += T ? E + T : E + " ")
                                }
                            } else v = g[0];
                            Y[o.type](i.target, o.property, v, i.transforms), o.currentValue = v, e++
                        }
                    }

                    function y(t) {
                        h[t] && !h.passThrough && h[t](h)
                    }

                    function b(t) {
                        var r = h.duration,
                            o = h.delay,
                            l = r - h.endDelay,
                            g = p(t);
                        h.progress = s(g / r * 100, 0, 100), h.reversePlayback = g < h.currentTime, e && function(t) {
                            if (h.reversePlayback)
                                for (var n = u; n--;) m(t, e[n]);
                            else
                                for (var r = 0; r < u; r++) m(t, e[r])
                        }(g), !h.began && h.currentTime > 0 && (h.began = !0, y("begin")), !h.loopBegan && h.currentTime > 0 && (h.loopBegan = !0, y("loopBegin")), g <= o && 0 !== h.currentTime && v(0), (g >= l && h.currentTime !== r || !r) && v(r), g > o && g < l ? (h.changeBegan || (h.changeBegan = !0, h.changeCompleted = !1, y("changeBegin")), y("change"), v(g)) : h.changeBegan && (h.changeCompleted = !0, h.changeBegan = !1, y("changeComplete")), h.currentTime = s(g, 0, r), h.began && y("update"), t >= r && (i = 0, h.remaining && !0 !== h.remaining && h.remaining--, h.remaining ? (n = a, y("loopComplete"), h.loopBegan = !1, "alternate" === h.direction && d()) : (h.paused = !0, h.completed || (h.completed = !0, y("loopComplete"), y("complete"), !h.passThrough && "Promise" in window && (c(), f(h)))))
                    }
                    return f(h), h.reset = function() {
                        var t = h.direction;
                        h.passThrough = !1, h.currentTime = 0, h.progress = 0, h.paused = !0, h.began = !1, h.loopBegan = !1, h.changeBegan = !1, h.completed = !1, h.changeCompleted = !1, h.reversePlayback = !1, h.reversed = "reverse" === t, h.remaining = h.loop, e = h.children;
                        for (var n = u = e.length; n--;) h.children[n].reset();
                        (h.reversed && !0 !== h.loop || "alternate" === t && 1 === h.loop) && h.remaining++, v(h.reversed ? h.duration : 0)
                    }, h._onDocumentVisibility = g, h.set = function(t, e) {
                        return z(t, e), h
                    }, h.tick = function(t) {
                        a = t, n || (n = a), b((a + (i - n)) * tt.speed)
                    }, h.seek = function(t) {
                        b(p(t))
                    }, h.pause = function() {
                        h.paused = !0, g()
                    }, h.play = function() {
                        h.paused && (h.completed && h.reset(), h.paused = !1, Q.push(h), g(), J())
                    }, h.reverse = function() {
                        d(), h.completed = !h.reversed, g()
                    }, h.restart = function() {
                        h.reset(), h.play()
                    }, h.remove = function(t) {
                        nt(H(t), h)
                    }, h.reset(), h.autoplay && h.play(), h
                }

                function et(t, e) {
                    for (var n = e.length; n--;) M(t, e[n].animatable.target) && e.splice(n, 1)
                }

                function nt(t, e) {
                    var n = e.animations,
                        r = e.children;
                    et(t, n);
                    for (var o = r.length; o--;) {
                        var i = r[o],
                            a = i.animations;
                        et(t, a), a.length || i.children.length || r.splice(o, 1)
                    }
                    n.length || r.length || e.pause()
                }
                tt.version = "3.2.1", tt.speed = 1, tt.suspendWhenDocumentHidden = !0, tt.running = Q, tt.remove = function(t) {
                    for (var e = H(t), n = Q.length; n--;) nt(e, Q[n])
                }, tt.get = L, tt.set = z, tt.convertPx = D, tt.path = function(t, e) {
                    var n = l.str(t) ? b(t)[0] : t,
                        r = e || 100;
                    return function(t) {
                        return {
                            property: t,
                            el: n,
                            svg: q(n),
                            totalLength: F(n) * (r / 100)
                        }
                    }
                }, tt.setDashoffset = function(t) {
                    var e = F(t);
                    return t.setAttribute("stroke-dasharray", e), e
                }, tt.stagger = function(t, e) {
                    void 0 === e && (e = {});
                    var n = e.direction || "normal",
                        r = e.easing ? y(e.easing) : null,
                        o = e.grid,
                        i = e.axis,
                        a = e.from || 0,
                        s = "first" === a,
                        u = "center" === a,
                        c = "last" === a,
                        f = l.arr(t),
                        h = f ? parseFloat(t[0]) : parseFloat(t),
                        d = f ? parseFloat(t[1]) : 0,
                        p = O(f ? t[1] : t) || 0,
                        g = e.start || 0 + (f ? h : 0),
                        m = [],
                        v = 0;
                    return function(t, e, l) {
                        if (s && (a = 0), u && (a = (l - 1) / 2), c && (a = l - 1), !m.length) {
                            for (var y = 0; y < l; y++) {
                                if (o) {
                                    var b = u ? (o[0] - 1) / 2 : a % o[0],
                                        w = u ? (o[1] - 1) / 2 : Math.floor(a / o[0]),
                                        _ = b - y % o[0],
                                        I = w - Math.floor(y / o[0]),
                                        M = Math.sqrt(_ * _ + I * I);
                                    "x" === i && (M = -_), "y" === i && (M = -I), m.push(M)
                                } else m.push(Math.abs(a - y));
                                v = Math.max.apply(Math, m)
                            }
                            r && (m = m.map((function(t) {
                                return r(t / v) * v
                            }))), "reverse" === n && (m = m.map((function(t) {
                                return i ? t < 0 ? -1 * t : -t : Math.abs(v - t)
                            })))
                        }
                        return g + (f ? (d - h) / v : h) * (Math.round(100 * m[e]) / 100) + p
                    }
                }, tt.timeline = function(t) {
                    void 0 === t && (t = {});
                    var e = tt(t);
                    return e.duration = 0, e.add = function(n, r) {
                        var i = Q.indexOf(e),
                            a = e.children;

                        function s(t) {
                            t.passThrough = !0
                        }
                        i > -1 && Q.splice(i, 1);
                        for (var u = 0; u < a.length; u++) s(a[u]);
                        var c = E(n, T(o, t));
                        c.targets = c.targets || t.targets;
                        var f = e.duration;
                        c.autoplay = !1, c.direction = e.direction, c.timelineOffset = l.und(r) ? f : S(r, f), s(e), e.seek(c.timelineOffset);
                        var h = tt(c);
                        s(h), a.push(h);
                        var d = Z(a, t);
                        return e.delay = d.delay, e.endDelay = d.endDelay, e.duration = d.duration, e.seek(0), e.reset(), e.autoplay && e.play(), e
                    }, e
                }, tt.easing = y, tt.penner = v, tt.random = function(t, e) {
                    return Math.floor(Math.random() * (e - t + 1)) + t
                };
                const rt = tt
            },
            "./node_modules/intersection-observer/intersection-observer.js": () => {
                ! function() {
                    "use strict";
                    if ("object" == typeof window)
                        if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) "isIntersecting" in window.IntersectionObserverEntry.prototype || Object.defineProperty(window.IntersectionObserverEntry.prototype, "isIntersecting", {
                            get: function() {
                                return this.intersectionRatio > 0
                            }
                        });
                        else {
                            var t = function(t) {
                                    for (var e = window.document, n = o(e); n;) n = o(e = n.ownerDocument);
                                    return e
                                }(),
                                e = [],
                                n = null,
                                r = null;
                            a.prototype.THROTTLE_TIMEOUT = 100, a.prototype.POLL_INTERVAL = null, a.prototype.USE_MUTATION_OBSERVER = !0, a._setupCrossOriginUpdater = function() {
                                return n || (n = function(t, n) {
                                    r = t && n ? f(t, n) : {
                                        top: 0,
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        width: 0,
                                        height: 0
                                    }, e.forEach((function(t) {
                                        t._checkForIntersections()
                                    }))
                                }), n
                            }, a._resetCrossOriginUpdater = function() {
                                n = null, r = null
                            }, a.prototype.observe = function(t) {
                                if (!this._observationTargets.some((function(e) {
                                        return e.element == t
                                    }))) {
                                    if (!t || 1 != t.nodeType) throw new Error("target must be an Element");
                                    this._registerInstance(), this._observationTargets.push({
                                        element: t,
                                        entry: null
                                    }), this._monitorIntersections(t.ownerDocument), this._checkForIntersections()
                                }
                            }, a.prototype.unobserve = function(t) {
                                this._observationTargets = this._observationTargets.filter((function(e) {
                                    return e.element != t
                                })), this._unmonitorIntersections(t.ownerDocument), 0 == this._observationTargets.length && this._unregisterInstance()
                            }, a.prototype.disconnect = function() {
                                this._observationTargets = [], this._unmonitorAllIntersections(), this._unregisterInstance()
                            }, a.prototype.takeRecords = function() {
                                var t = this._queuedEntries.slice();
                                return this._queuedEntries = [], t
                            }, a.prototype._initThresholds = function(t) {
                                var e = t || [0];
                                return Array.isArray(e) || (e = [e]), e.sort().filter((function(t, e, n) {
                                    if ("number" != typeof t || isNaN(t) || t < 0 || t > 1) throw new Error("threshold must be a number between 0 and 1 inclusively");
                                    return t !== n[e - 1]
                                }))
                            }, a.prototype._parseRootMargin = function(t) {
                                var e = (t || "0px").split(/\s+/).map((function(t) {
                                    var e = /^(-?\d*\.?\d+)(px|%)$/.exec(t);
                                    if (!e) throw new Error("rootMargin must be specified in pixels or percent");
                                    return {
                                        value: parseFloat(e[1]),
                                        unit: e[2]
                                    }
                                }));
                                return e[1] = e[1] || e[0], e[2] = e[2] || e[0], e[3] = e[3] || e[1], e
                            }, a.prototype._monitorIntersections = function(e) {
                                var n = e.defaultView;
                                if (n && -1 == this._monitoringDocuments.indexOf(e)) {
                                    var r = this._checkForIntersections,
                                        i = null,
                                        a = null;
                                    this.POLL_INTERVAL ? i = n.setInterval(r, this.POLL_INTERVAL) : (s(n, "resize", r, !0), s(e, "scroll", r, !0), this.USE_MUTATION_OBSERVER && "MutationObserver" in n && (a = new n.MutationObserver(r)).observe(e, {
                                        attributes: !0,
                                        childList: !0,
                                        characterData: !0,
                                        subtree: !0
                                    })), this._monitoringDocuments.push(e), this._monitoringUnsubscribes.push((function() {
                                        var t = e.defaultView;
                                        t && (i && t.clearInterval(i), u(t, "resize", r, !0)), u(e, "scroll", r, !0), a && a.disconnect()
                                    }));
                                    var c = this.root && (this.root.ownerDocument || this.root) || t;
                                    if (e != c) {
                                        var l = o(e);
                                        l && this._monitorIntersections(l.ownerDocument)
                                    }
                                }
                            }, a.prototype._unmonitorIntersections = function(e) {
                                var n = this._monitoringDocuments.indexOf(e);
                                if (-1 != n) {
                                    var r = this.root && (this.root.ownerDocument || this.root) || t,
                                        i = this._observationTargets.some((function(t) {
                                            var n = t.element.ownerDocument;
                                            if (n == e) return !0;
                                            for (; n && n != r;) {
                                                var i = o(n);
                                                if ((n = i && i.ownerDocument) == e) return !0
                                            }
                                            return !1
                                        }));
                                    if (!i) {
                                        var a = this._monitoringUnsubscribes[n];
                                        if (this._monitoringDocuments.splice(n, 1), this._monitoringUnsubscribes.splice(n, 1), a(), e != r) {
                                            var s = o(e);
                                            s && this._unmonitorIntersections(s.ownerDocument)
                                        }
                                    }
                                }
                            }, a.prototype._unmonitorAllIntersections = function() {
                                var t = this._monitoringUnsubscribes.slice(0);
                                this._monitoringDocuments.length = 0, this._monitoringUnsubscribes.length = 0;
                                for (var e = 0; e < t.length; e++) t[e]()
                            }, a.prototype._checkForIntersections = function() {
                                if (this.root || !n || r) {
                                    var t = this._rootIsInDom(),
                                        e = t ? this._getRootRect() : {
                                            top: 0,
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            width: 0,
                                            height: 0
                                        };
                                    this._observationTargets.forEach((function(r) {
                                        var o = r.element,
                                            a = c(o),
                                            s = this._rootContainsTarget(o),
                                            u = r.entry,
                                            l = t && s && this._computeTargetAndRootIntersection(o, a, e),
                                            f = null;
                                        this._rootContainsTarget(o) ? n && !this.root || (f = e) : f = {
                                            top: 0,
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            width: 0,
                                            height: 0
                                        };
                                        var h = r.entry = new i({
                                            time: window.performance && performance.now && performance.now(),
                                            target: o,
                                            boundingClientRect: a,
                                            rootBounds: f,
                                            intersectionRect: l
                                        });
                                        u ? t && s ? this._hasCrossedThreshold(u, h) && this._queuedEntries.push(h) : u && u.isIntersecting && this._queuedEntries.push(h) : this._queuedEntries.push(h)
                                    }), this), this._queuedEntries.length && this._callback(this.takeRecords(), this)
                                }
                            }, a.prototype._computeTargetAndRootIntersection = function(e, o, i) {
                                if ("none" != window.getComputedStyle(e).display) {
                                    for (var a, s, u, l, h, p, g, m, v = o, y = d(e), b = !1; !b && y;) {
                                        var w = null,
                                            _ = 1 == y.nodeType ? window.getComputedStyle(y) : {};
                                        if ("none" == _.display) return null;
                                        if (y == this.root || 9 == y.nodeType)
                                            if (b = !0, y == this.root || y == t) n && !this.root ? !r || 0 == r.width && 0 == r.height ? (y = null, w = null, v = null) : w = r : w = i;
                                            else {
                                                var I = d(y),
                                                    M = I && c(I),
                                                    x = I && this._computeTargetAndRootIntersection(I, M, i);
                                                M && x ? (y = I, w = f(M, x)) : (y = null, v = null)
                                            }
                                        else {
                                            var T = y.ownerDocument;
                                            y != T.body && y != T.documentElement && "visible" != _.overflow && (w = c(y))
                                        }
                                        if (w && (a = w, s = v, void 0, void 0, void 0, void 0, void 0, void 0, u = Math.max(a.top, s.top), l = Math.min(a.bottom, s.bottom), h = Math.max(a.left, s.left), m = l - u, v = (g = (p = Math.min(a.right, s.right)) - h) >= 0 && m >= 0 && {
                                                top: u,
                                                bottom: l,
                                                left: h,
                                                right: p,
                                                width: g,
                                                height: m
                                            } || null), !v) break;
                                        y = y && d(y)
                                    }
                                    return v
                                }
                            }, a.prototype._getRootRect = function() {
                                var e;
                                if (this.root && !p(this.root)) e = c(this.root);
                                else {
                                    var n = p(this.root) ? this.root : t,
                                        r = n.documentElement,
                                        o = n.body;
                                    e = {
                                        top: 0,
                                        left: 0,
                                        right: r.clientWidth || o.clientWidth,
                                        width: r.clientWidth || o.clientWidth,
                                        bottom: r.clientHeight || o.clientHeight,
                                        height: r.clientHeight || o.clientHeight
                                    }
                                }
                                return this._expandRectByRootMargin(e)
                            }, a.prototype._expandRectByRootMargin = function(t) {
                                var e = this._rootMarginValues.map((function(e, n) {
                                        return "px" == e.unit ? e.value : e.value * (n % 2 ? t.width : t.height) / 100
                                    })),
                                    n = {
                                        top: t.top - e[0],
                                        right: t.right + e[1],
                                        bottom: t.bottom + e[2],
                                        left: t.left - e[3]
                                    };
                                return n.width = n.right - n.left, n.height = n.bottom - n.top, n
                            }, a.prototype._hasCrossedThreshold = function(t, e) {
                                var n = t && t.isIntersecting ? t.intersectionRatio || 0 : -1,
                                    r = e.isIntersecting ? e.intersectionRatio || 0 : -1;
                                if (n !== r)
                                    for (var o = 0; o < this.thresholds.length; o++) {
                                        var i = this.thresholds[o];
                                        if (i == n || i == r || i < n != i < r) return !0
                                    }
                            }, a.prototype._rootIsInDom = function() {
                                return !this.root || h(t, this.root)
                            }, a.prototype._rootContainsTarget = function(e) {
                                var n = this.root && (this.root.ownerDocument || this.root) || t;
                                return h(n, e) && (!this.root || n == e.ownerDocument)
                            }, a.prototype._registerInstance = function() {
                                e.indexOf(this) < 0 && e.push(this)
                            }, a.prototype._unregisterInstance = function() {
                                var t = e.indexOf(this); - 1 != t && e.splice(t, 1)
                            }, window.IntersectionObserver = a, window.IntersectionObserverEntry = i
                        }
                    function o(t) {
                        try {
                            return t.defaultView && t.defaultView.frameElement || null
                        } catch (t) {
                            return null
                        }
                    }

                    function i(t) {
                        this.time = t.time, this.target = t.target, this.rootBounds = l(t.rootBounds), this.boundingClientRect = l(t.boundingClientRect), this.intersectionRect = l(t.intersectionRect || {
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            width: 0,
                            height: 0
                        }), this.isIntersecting = !!t.intersectionRect;
                        var e = this.boundingClientRect,
                            n = e.width * e.height,
                            r = this.intersectionRect,
                            o = r.width * r.height;
                        this.intersectionRatio = n ? Number((o / n).toFixed(4)) : this.isIntersecting ? 1 : 0
                    }

                    function a(t, e) {
                        var n, r, o, i = e || {};
                        if ("function" != typeof t) throw new Error("callback must be a function");
                        if (i.root && 1 != i.root.nodeType && 9 != i.root.nodeType) throw new Error("root must be a Document or Element");
                        this._checkForIntersections = (n = this._checkForIntersections.bind(this), r = this.THROTTLE_TIMEOUT, o = null, function() {
                            o || (o = setTimeout((function() {
                                n(), o = null
                            }), r))
                        }), this._callback = t, this._observationTargets = [], this._queuedEntries = [], this._rootMarginValues = this._parseRootMargin(i.rootMargin), this.thresholds = this._initThresholds(i.threshold), this.root = i.root || null, this.rootMargin = this._rootMarginValues.map((function(t) {
                            return t.value + t.unit
                        })).join(" "), this._monitoringDocuments = [], this._monitoringUnsubscribes = []
                    }

                    function s(t, e, n, r) {
                        "function" == typeof t.addEventListener ? t.addEventListener(e, n, r || !1) : "function" == typeof t.attachEvent && t.attachEvent("on" + e, n)
                    }

                    function u(t, e, n, r) {
                        "function" == typeof t.removeEventListener ? t.removeEventListener(e, n, r || !1) : "function" == typeof t.detatchEvent && t.detatchEvent("on" + e, n)
                    }

                    function c(t) {
                        var e;
                        try {
                            e = t.getBoundingClientRect()
                        } catch (t) {}
                        return e ? (e.width && e.height || (e = {
                            top: e.top,
                            right: e.right,
                            bottom: e.bottom,
                            left: e.left,
                            width: e.right - e.left,
                            height: e.bottom - e.top
                        }), e) : {
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            width: 0,
                            height: 0
                        }
                    }

                    function l(t) {
                        return !t || "x" in t ? t : {
                            top: t.top,
                            y: t.top,
                            bottom: t.bottom,
                            left: t.left,
                            x: t.left,
                            right: t.right,
                            width: t.width,
                            height: t.height
                        }
                    }

                    function f(t, e) {
                        var n = e.top - t.top,
                            r = e.left - t.left;
                        return {
                            top: n,
                            left: r,
                            height: e.height,
                            width: e.width,
                            bottom: n + e.height,
                            right: r + e.width
                        }
                    }

                    function h(t, e) {
                        for (var n = e; n;) {
                            if (n == t) return !0;
                            n = d(n)
                        }
                        return !1
                    }

                    function d(e) {
                        var n = e.parentNode;
                        return 9 == e.nodeType && e != t ? o(e) : (n && n.assignedSlot && (n = n.assignedSlot.parentNode), n && 11 == n.nodeType && n.host ? n.host : n)
                    }

                    function p(t) {
                        return t && 9 === t.nodeType
                    }
                }()
            },
            "./src/js/animations/ParagraphAnimation.js": (t, e, n) => {
                "use strict";
                n.r(e), n.d(e, {
                    default: () => s
                });
                var r = n("./node_modules/animejs/lib/anime.es.js"),
                    o = n("./src/js/classes/Animation.js"),
                    i = n("./src/js/utils/text.js");
                class a extends o.default {
                    constructor({
                        el: t
                    }) {
                        super({
                            el: t
                        }), this.addSpansToTitle()
                    }
                    addSpansToTitle() {
                        (0, i.wrapLines)(this.el, "div", "inline-block flex justify-between")
                    }
                    animateIn() {
                        const {
                            height: t
                        } = this.el.getBoundingClientRect();
                        (0, r.default)({
                            targets: this.el.querySelectorAll("div"),
                            opacity: [0, 1],
                            translateY: [t, 0],
                            delay: r.default.stagger(300, {
                                start: 1500
                            }),
                            duration: 1e3,
                            easing: "spring(1, 100, 50, 0)"
                        })
                    }
                    animateOut() {
                        (0, r.default)({
                            targets: this.el,
                            opacity: [1, 0],
                            duration: 500
                        })
                    }
                }
                const s = a
            },
            "./src/js/animations/TitleAnimation.js": (t, e, n) => {
                "use strict";
                n.r(e), n.d(e, {
                    default: () => a
                });
                var r = n("./node_modules/animejs/lib/anime.es.js"),
                    o = n("./src/js/classes/Animation.js");
                n("./src/js/utils/text.js");
                class i extends o.default {
                    constructor({
                        el: t,
                        delay: e = 0
                    }) {
                        super({
                            el: t
                        }), this.delay = e, this.animated = !1
                    }
                    animateIn() {
                        if (this.animated) return;
                        this.animated = !0;
                        const {
                            height: t
                        } = this.el.getBoundingClientRect();
                        r.default.timeline().add({
                            targets: this.el,
                            opacity: [0, 1],
                            translateY: [t / 2, 0],
                            duration: 2e3,
                            easing: "spring(1, 80, 50, 0)",
                            delay: this.delay
                        })
                    }
                    animateOut() {}
                }
                const a = i
            },
            "./src/js/classes/Animation.js": (t, e, n) => {
                "use strict";
                n.r(e), n.d(e, {
                    default: () => r
                }), n("./node_modules/intersection-observer/intersection-observer.js");
                const r = class {
                    constructor({
                        el: t
                    }) {
                        this.el = t, this.observe()
                    }
                    animateIn() {}
                    animateOut() {}
                    observe() {
                        this.observer = new IntersectionObserver((t => {
                            t.forEach((t => {
                                t.isIntersecting ? this.animateIn() : this.animateOut()
                            }))
                        })), this.observer.observe(this.el)
                    }
                    removeObserve() {
                        this.observer && this.observer.unobserve && this.observer.unobserve(this.el)
                    }
                }
            },
            "./src/js/utils/text.js": (t, e, n) => {
                "use strict";
                n.r(e), n.d(e, {
                    wrapCharacters: () => r,
                    wrapLines: () => i,
                    wrapWords: () => o
                });
                const r = (t, e = "span", n) => (t.innerHTML = t.textContent.replace(/\S/g, `<${e} ${n?`class="${n}"`:""}>$&</${e}>`), t),
                    o = (t, e = "span", n) => (t.innerHTML = t.textContent.replace(/\S+/g, `<${e} ${n?`class="${n}"`:""}>$&</${e}>`), t),
                    i = (t, e = "span", n) => {
                        const r = o(t).children,
                            i = Array.from(r).reduce(((t, e, n, r) => {
                                const {
                                    top: o
                                } = e.getBoundingClientRect();
                                return { ...t,
                                    [o]: [...t[o] ? t[o] : [], e]
                                }
                            }), {});
                        return Object.values(i).map((r => {
                            const o = document.createElement(e);
                            o.className = n || "", r.forEach((t => o.appendChild(t))), t.appendChild(o)
                        })), t
                    }
            }
        },
        e = {};

    function n(r) {
        var o = e[r];
        if (void 0 !== o) return o.exports;
        var i = e[r] = {
            exports: {}
        };
        return t[r](i, i.exports, n), i.exports
    }
    n.n = t => {
        var e = t && t.__esModule ? () => t.default : () => t;
        return n.d(e, {
            a: e
        }), e
    }, n.d = (t, e) => {
        for (var r in e) n.o(e, r) && !n.o(t, r) && Object.defineProperty(t, r, {
            enumerable: !0,
            get: e[r]
        })
    }, n.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e), n.r = t => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(t, "__esModule", {
            value: !0
        })
    };
    var r = {};
    (() => {
        "use strict";
        n.r(r);
        var t = n("./src/js/animations/TitleAnimation.js"),
            e = n("./src/js/animations/ParagraphAnimation.js");
        (() => {
            const n = () => {
                document.querySelectorAll('[data-animate="title"]').forEach((e => {
                    new t.default({
                        el: e
                    })
                })), document.querySelectorAll('[data-animate="paragraph"]').forEach((t => {
                    new e.default({
                        el: t
                    })
                }))
            };
            "loading" !== document.readyState ? n() : document.addEventListener("DOMContentLoaded", n)
        })()
    })()
})();
//# sourceMappingURL=app.js.map