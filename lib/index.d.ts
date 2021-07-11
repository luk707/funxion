declare namespace Funxion {
    export type TokenType = "literal_bool" | "literal_number" | "literal_string" | "bool" | "number" | "string" | "op_add" | "op_sub" | "op_mul" | "op_div" | "op_mod" | "op_pow" | "paren_open" | "paren_close" | "comma" | "whitespace" | "params" | "ident";
    export interface Token {
        type: TokenType;
        value: any;
    }
    type ParserResult = {
        tokens: Token[];
        vars: string[];
    };
    export const parse: (expression: string) => ParserResult;
    export const exec: ({ tokens }: ParserResult, context?: Record<string, any>, functions?: Record<string, (...params: any[]) => any>) => any;
    export {};
}
export default Funxion;
