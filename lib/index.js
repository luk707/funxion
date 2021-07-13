"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Funxion;
(function (Funxion) {
    const stdFns = {
        if(condition, trueValue, falseValue) {
            return condition ? trueValue : falseValue;
        },
        join(...words) {
            return words.join("");
        },
        mean(...numbers) {
            return numbers.reduce((acc, cur) => acc + cur, 0) / numbers.length;
        },
    };
    const getFunctionExecutor = (customFns = {}) => (name, params) => {
        const fn = { ...stdFns, ...customFns }[name];
        if (!fn) {
            throw `No function named ${name} exists.`;
        }
        return fn(...params);
    };
    const tokens = {
        number: /\d+(\.\d+)?/,
        string: /\"(\\.|[^\"])*\"/,
        bool: /true|false/,
        op_add: /\+/,
        op_sub: /\-/,
        op_mul: /\*/,
        op_div: /\//,
        op_mod: /\%/,
        op_pow: /\^/,
        paren_open: /\(/,
        paren_close: /\)/,
        comma: /\,/,
        whitespace: /\s+/,
        ident: /[a-zA-Z]+/,
    };
    const grammar = [
        {
            match: [
                "ident",
                "paren_open",
                ["number", "string", "bool"],
                "paren_close",
            ],
            transform: (t) => [
                t[0],
                t[1],
                { type: "params", value: [t[2].value] },
                t[3],
            ],
        },
        {
            match: ["number", "paren_open", "number", "paren_close"],
            transform: (t) => [
                {
                    type: "number",
                    value: t[0].value * t[2].value,
                },
            ],
        },
        {
            match: ["paren_open", "number", "paren_close"],
            transform: (t) => [{ type: "number", value: t[1].value }],
        },
        {
            match: ["number", "op_pow", "number"],
            transform: (t) => [
                { type: "number", value: Math.pow(t[0].value, t[2].value) },
            ],
        },
        {
            match: ["number", "op_div", "number"],
            transform: (t) => [{ type: "number", value: t[0].value / t[2].value }],
        },
        {
            match: ["number", "op_mul", "number"],
            transform: (t) => [{ type: "number", value: t[0].value * t[2].value }],
        },
        {
            match: ["number", "op_mod", "number"],
            transform: (t) => [{ type: "number", value: t[0].value % t[2].value }],
        },
        {
            match: ["number", "op_add", "number"],
            transform: (t) => [{ type: "number", value: t[0].value + t[2].value }],
        },
        {
            match: ["number", "op_sub", "number"],
            transform: (t) => [{ type: "number", value: t[0].value - t[2].value }],
        },
        {
            match: [
                ["number", "bool", "string"],
                "comma",
                ["number", "bool", "string"],
            ],
            transform: (t) => [{ type: "params", value: [t[0].value, t[2].value] }],
        },
        {
            match: ["params", "comma", ["number", "bool", "string"]],
            transform: (t) => [
                { type: "params", value: [...t[0].value, t[2].value] },
            ],
        },
        {
            match: ["params", "comma", "params"],
            transform: (t) => [
                { type: "params", value: [...t[0].value, ...t[2].value] },
            ],
        },
        {
            match: ["ident", "paren_open", "paren_close"],
            transform: (t) => [t[0], t[1], { type: "params", value: [] }, t[2]],
        },
        {
            match: ["ident", "paren_open", "params", "paren_close"],
            transform: (t, _, execStdFn) => {
                const value = execStdFn(t[0].value, t[2].value);
                switch (typeof value) {
                    case "number":
                        return [{ type: "number", value }];
                    case "boolean":
                        return [{ type: "bool", value }];
                    case "string":
                        return [{ type: "string", value }];
                    default:
                        throw `INTERNAL ERROR: Bad return type ${typeof value} from std function ${t[0].value}`;
                }
            },
        },
        {
            match: ["ident"],
            transform: (t, ctx) => {
                const value = ctx[t[0].value];
                switch (typeof value) {
                    case "number":
                        return [{ type: "number", value }];
                    case "string":
                        return [{ type: "string", value }];
                    case "boolean":
                        return [{ type: "bool", value }];
                    default:
                        throw `TypeError: Unexpected ${typeof value} type for variable '${t[0].value}'`;
                }
            },
        },
    ];
    Funxion.parse = (expression) => {
        let source = expression;
        let pointer = 0;
        const result = [];
        const vars = new Set();
        while (pointer < source.length) {
            let foundMatch = false;
            for (const token in tokens) {
                const match = source.slice(pointer).match(tokens[token]);
                if (match && match.index === 0) {
                    switch (token) {
                        case "whitespace":
                            break;
                        case "ident":
                            vars.add(match[0]);
                            result.push({
                                type: token,
                                value: match[0],
                            });
                            break;
                        case "number":
                            result.push({
                                type: token,
                                value: parseFloat(match[0]),
                            });
                            break;
                        case "string":
                            result.push({
                                type: token,
                                value: JSON.parse(match[0]),
                            });
                            break;
                        case "bool":
                            result.push({
                                type: token,
                                value: match[0] === "true",
                            });
                            break;
                        default:
                            result.push({ type: token, value: match[0] });
                            break;
                    }
                    pointer += match.index + match[0].length;
                    foundMatch = true;
                }
            }
            if (!foundMatch) {
                throw `Error at :${pointer}`;
            }
        }
        return {
            tokens: result,
            vars: [...vars],
        };
    };
    Funxion.exec = ({ tokens }, context = {}, functions = {}) => {
        var _a, _b;
        let program = tokens;
        while (program.length > 1) {
            let couldReduce = false;
            for (const node of grammar) {
                let pointerLen = node.match.length;
                let pointer = 0;
                let match = false;
                while (pointer + pointerLen <= program.length) {
                    match = true;
                    for (let i = 0; i < pointerLen; i++) {
                        if (typeof node.match[i] === "string"
                            ? ((_a = program[pointer + i]) === null || _a === void 0 ? void 0 : _a.type) !== node.match[i]
                            : !node.match[i].includes((_b = program[pointer + i]) === null || _b === void 0 ? void 0 : _b.type)) {
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        couldReduce = true;
                        const newTokens = node.transform(program.slice(pointer, pointer + pointerLen), context, getFunctionExecutor(functions));
                        program = [
                            ...program.slice(0, pointer),
                            ...newTokens,
                            ...program.slice(pointer + pointerLen),
                        ];
                        break;
                    }
                    else {
                        pointer++;
                    }
                }
                if (match) {
                    break;
                }
            }
            if (!couldReduce) {
                throw "Invalid expression";
            }
        }
        if (!["number", "bool", "string"].includes(program[0].type)) {
            throw "Something went wrong!";
        }
        return program[0].value;
    };
})(Funxion || (Funxion = {}));
exports.default = Funxion;
