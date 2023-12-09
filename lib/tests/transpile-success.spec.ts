import { describe, expect, it } from 'vitest'
import { transpileSource } from '../transpile'

describe('Transpile source code successfully', () => {
  it("Function declaration let extracts the callee's name, arguments, params and snapshots", () => {
    const source = `
      function foo(a, b) {
        return a + b
      }
      foo(1, 2)
    `
    const { params, args, entryPoint, snapshots } = transpileSource(source)
    expect(params).toStrictEqual(['a', 'b'])
    expect(args).toStrictEqual([1, 2])
    expect(entryPoint.name).toBe('foo')
    expect(snapshots.data).toStrictEqual([])
  })

  // TODO: Unexpected token 'export' seems to be an ES Module but shipped in a CommonJS package.
  // it("Function declaration with export name , let extracts the callee's name, arguments, params and snapshots", () => {
  //   const source = `
  //     export function foo(a, b) {
  //       return a + b
  //     }
  //     foo(1, 2)
  //   `

  //   const { params, args, entryPoint, snapshots } = transpileSource(source)
  //   expect(params).toStrictEqual(['a', 'b'])
  //   expect(args).toStrictEqual([1, 2])
  //   expect(entryPoint.name).toBe('foo')
  //   expect(snapshots.data).toStrictEqual([])
  // })

  it("Function expression extracts the callee's name, arguments, params and snapshots", () => {
    const source = `
      const foo = function (a, b) {
        return a + b
      }
      foo(1, 2)
    `
    const { params, args, entryPoint, snapshots } = transpileSource(source)
    expect(params).toStrictEqual(['a', 'b'])
    expect(args).toStrictEqual([1, 2])
    expect(entryPoint.name).toBe('foo')
    expect(snapshots.data).toStrictEqual([])
  })

  it("Function expression(ES6) extracts the callee's name, arguments, params and snapshots", () => {
    const source = `
      const foo = (a, b) => {
        return a + b
      }
      foo(1, 2)
    `
    const { params, args, entryPoint, snapshots } = transpileSource(source)
    expect(params).toStrictEqual(['a', 'b'])
    expect(args).toStrictEqual([1, 2])
    expect(entryPoint.name).toBe('foo')
    expect(snapshots.data).toStrictEqual([])
  })

  // TODO: Unexpected token 'export' seems to be an ES Module but shipped in a CommonJS package.
  // it("Function expression with export name extracts the callee's name, arguments, params and snapshots", () => {
  //   const source = `
  //     export const foo = (a, b) => {
  //       return a + b
  //     }
  //     foo(1, 2)
  //   `
  //   const { params, args, entryPoint, snapshots } = transpileSource(source)
  //   expect(params).toStrictEqual(['a', 'b'])
  //   expect(args).toStrictEqual([1, 2])
  //   expect(entryPoint.name).toBe('foo')
  //   expect(snapshots.data).toStrictEqual([])
  // })
})
