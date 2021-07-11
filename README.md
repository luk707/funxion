# Funxion

Safely execute arbitrary user defined logical expressions.

## Usage

Before you can execute an expression, it must be parsed. This will tell you if the expression is valid and inform you of errors if applicable.

The result is a parsed version of your expression ready for execution.

_NOTE: Calling parse with an invalid expression will result in an error being thrown._

```ts
const add = Funxion.parse("a + b");
```

To execute this expression, parse the result of the parser to the exec function, along with any context variables you want to use:

```ts
const result = Funxion.exec(add, { a: 2, b: 3 });
```

## Variables

Pass a key value context that can be accessed in your expressions:

```ts
const [example] = Funxion.parse("foo * 5");
Funxion.exec(example, { foo: 2 });
// => 10
```

## Functions

### If

If accepts a boolean as its first argument, returning the second argument if it is true, and the third argument if it is false.

```fxn
if(true, "Hooray!", "Awwwhh!")
// => "Hooray!"
```

### Join

Join a set of strings together

```fxn
join("Hello, ", "World!")
// => "Hello, World!"
```

### Mean

Calculate the mean of a set of numbers

```fxn
mean(2, 5, 11, 23)
// => 10.25
```
