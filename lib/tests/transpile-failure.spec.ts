import { describe, expect, it } from 'vitest'
import { transpileSource } from '../transpile'

describe('Transpile source code failure', () => {
  it('If program contains two callee identifiers, throw an error', () => {
    const source = `
      function foo() {
        const a = 1
        const b = 2
        return a + b
      }
      function bar() {
        const a = 1
        const b = 2
        return a + b
      }
      bar()
      foo()
    `

    expect(() => transpileSource(source)).toThrowError(
      `Calling multiple functions is not allowed. You have ${2} calls.`,
    )
  })

  it("If program doesn't call a function, throw an error", () => {
    const source = `
      function foo() {
        const a = 1
        const b = 2
        return a + b
      }
      function bar() {
        const a = 1
        const b = 2
        return a + b
      }
    `
    expect(() => transpileSource(source)).toThrowError(
      `Your program must call a function. Please call your function.`,
    )
  })

  // TODO: Unexpected token 'export' seems to be an ES Module but shipped in a CommonJS package.
  it('If function declaration with export name', () => {
    const source = `
      export function foo(a, b) {
        return a + b
      }
      foo(1, 2)
    `
    expect(() => transpileSource(source)).toThrowError(
      "Unexpected token 'export'",
    )
  })

  // TODO: Unexpected token 'export' seems to be an ES Module but shipped in a CommonJS package.
  it('If function expression with export name', () => {
    const source = `
     export const foo = function (a, b) {
        return a + b
      }
      foo(1, 2)
    `
    expect(() => transpileSource(source)).toThrowError(
      "Unexpected token 'export'",
    )
  })

  // TODO: Unexpected token 'export' seems to be an ES Module but shipped in a CommonJS package.
  it('If function expression(ES6) with export name', () => {
    const source = `
      export const foo = (a, b) => {
        return a + b
      }
      foo(1, 2)
    `
    expect(() => transpileSource(source)).toThrowError(
      "Unexpected token 'export'",
    )
  })
})
