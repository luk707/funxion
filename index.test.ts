import Funxion from "./index";

describe("Funxion.parse", () => {
  it("returns correct token array for given expression", () => {
    expect(Funxion.parse("a + b").tokens).toEqual([
      { type: "ident", value: "a" },
      { type: "op_add", value: "+" },
      { type: "ident", value: "b" },
    ]);
  });

  it("reports expected variables", () => {
    expect(Funxion.parse("a + b").vars).toEqual(["a", "b"]);
  });

  it("correctly tokenises numbers", () => {
    expect(Funxion.parse("1.234").tokens).toEqual([
      { type: "number", value: 1.234 },
    ]);
  });

  it("correctly tokenises strings", () => {
    expect(Funxion.parse('join("This is a \\"simple\\" test")').tokens).toEqual(
      [
        { type: "ident", value: "join" },
        { type: "paren_open", value: "(" },
        { type: "string", value: 'This is a "simple" test' },
        { type: "paren_close", value: ")" },
      ]
    );
  });

  it("correctly tokenises bools", () => {
    expect(Funxion.parse("true").tokens).toEqual([
      { type: "bool", value: true },
    ]);
    expect(Funxion.parse("false").tokens).toEqual([
      { type: "bool", value: false },
    ]);
  });

  it("correctly tokenises function expressions", () => {
    expect(Funxion.parse("test()").tokens).toEqual([
      { type: "ident", value: "test" },
      { type: "paren_open", value: "(" },
      { type: "paren_close", value: ")" },
    ]);
  });
});

describe("Funxion.exec", () => {
  it("correctly executes expression with variables", () => {
    expect(
      Funxion.exec(
        {
          tokens: [
            { type: "ident", value: "a" },
            { type: "op_add", value: "+" },
            { type: "ident", value: "b" },
          ],
          vars: ["a", "b"],
        },
        { a: 10, b: 5 }
      )
    ).toEqual(15);
  });

  it("respects the order of operations", () => {
    expect(
      Funxion.exec(
        {
          tokens: [
            { type: "paren_open", value: "(" },
            { type: "number", value: 7 },
            { type: "op_add", value: "+" },
            { type: "paren_open", value: "(" },
            { type: "number", value: 6 },
            { type: "op_mul", value: "*" },
            { type: "number", value: 5 },
            { type: "op_pow", value: "^" },
            { type: "number", value: 2 },
            { type: "op_add", value: "+" },
            { type: "number", value: 3 },
            { type: "paren_close", value: ")" },
            { type: "paren_close", value: ")" },
            { type: "op_div", value: "/" },
            { type: "number", value: 2 },
          ],
          vars: [],
        },
        {}
      )
    ).toEqual(80);
  });

  it("correctly computes std function 'if'", () => {
    expect(
      Funxion.exec(
        {
          tokens: [
            { type: "ident", value: "if" },
            { type: "paren_open", value: "(" },
            { type: "bool", value: "true" },
            { type: "comma", value: "," },
            { type: "string", value: "SUCCESS" },
            { type: "comma", value: "," },
            { type: "string", value: "FAIL" },
            { type: "paren_close", value: ")" },
          ],
          vars: [],
        },
        {}
      )
    ).toEqual("SUCCESS");
  });

  it("correctly computes std function 'join'", () => {
    expect(
      Funxion.exec(
        {
          tokens: [
            { type: "ident", value: "join" },
            { type: "paren_open", value: "(" },
            { type: "string", value: "Hello," },
            { type: "comma", value: "," },
            { type: "string", value: " World!" },
            { type: "paren_close", value: ")" },
          ],
          vars: [],
        },
        {}
      )
    ).toEqual("Hello, World!");
  });

  it("correctly computes std function 'mean'", () => {
    expect(
      Funxion.exec(
        {
          tokens: [
            { type: "ident", value: "mean" },
            { type: "paren_open", value: "(" },
            { type: "number", value: 6 },
            { type: "comma", value: "," },
            { type: "number", value: 3 },
            { type: "comma", value: "," },
            { type: "number", value: 100 },
            { type: "comma", value: "," },
            { type: "number", value: 3 },
            { type: "comma", value: "," },
            { type: "number", value: 13 },
            { type: "paren_close", value: ")" },
          ],
          vars: [],
        },
        {}
      )
    ).toEqual(25);
  });

  it("supports custom functions", () => {
    expect(
      Funxion.exec(
        {
          tokens: [
            { type: "ident", value: "foo" },
            { type: "paren_open", value: "(" },
            { type: "number", value: 1 },
            { type: "paren_close", value: ")" },
          ],
          vars: [],
        },
        {},
        { foo: (v) => v + 1 }
      )
    ).toEqual(2);
  });

  it("does not crash with invalid token sequence", () => {
    expect(() =>
      Funxion.exec(
        {
          tokens: [
            { type: "ident", value: "foo" },
            { type: "op_mul", value: "*" },
            { type: "number", value: 5 },
          ],
          vars: [],
        },
        { foo: "hi" }
      )
    ).toThrow("Invalid expression");
  });
});
