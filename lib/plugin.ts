import {
  buildMetadata,
  createSnapshot,
  createVariable,
  getCallFunctionArgs,
  getFunctionDeclarationIdentifierName,
  getFunctionParams,
  getNames,
  getParams,
} from './utils'
import type { FunctionExpression } from '@babel/types'
import type { Babel } from './types'
import type { PluginObj } from '@babel/core'

export function customPlugin(babel: Babel): PluginObj {
  const { types: t } = babel
  return {
    name: 'custom-plugin',
    visitor: {
      Program(path) {
        const declareFunctions = path.node.body.filter(
          (statement) =>
            t.isFunctionDeclaration(statement) ||
            (t.isVariableDeclaration(statement) &&
              t.isExportDefaultDeclaration(statement)),
        )

        if (declareFunctions.length > 1) {
          throw new Error(
            `Only one function declaration or arrow function expression is allowed.
            You have ${declareFunctions.length} declarations.`,
          )
        }

        const declareFunction = path.node.body.find(
          (statement) =>
            t.isFunctionDeclaration(statement) ||
            t.isVariableDeclaration(statement) ||
            (t.isExportDefaultDeclaration(statement) &&
              t.isFunctionDeclaration(statement.declaration)),
        )

        let entryPoint: string | undefined
        let type:
          | 'Identifier'
          | 'FunctionDeclaration'
          | 'ArrowFunctionExpression'
          | null = null

        const params: string[] = []

        if (
          t.isFunctionDeclaration(declareFunction) ||
          t.isExportDefaultDeclaration(declareFunction)
        ) {
          // function foo() {}
          const functionDeclarationIdentifierName =
            getFunctionDeclarationIdentifierName(declareFunction)

          const exportDefaultDeclaration = path.node.body.find((statement) =>
            t.isExportDefaultDeclaration(statement),
          )

          if (!t.isExportDefaultDeclaration(exportDefaultDeclaration)) {
            throw new Error(
              `Your function ${functionDeclarationIdentifierName} must be exported as a default export.`,
            )
          }

          entryPoint = functionDeclarationIdentifierName
          type = t.isFunctionDeclaration(declareFunction)
            ? 'FunctionDeclaration'
            : 'Identifier'

          const paramKeys = getFunctionParams(declareFunction)
          params.push(...paramKeys)
        } else if (t.isVariableDeclaration(declareFunction)) {
          // const foo = () => {} or const foo = function() {}
          const firstDeclaration = declareFunction.declarations[0]
          if (
            !t.isIdentifier(firstDeclaration.id) ||
            (!t.isFunctionExpression(firstDeclaration.init) &&
              !t.isArrowFunctionExpression(firstDeclaration.init))
          ) {
            throw new Error(
              `Your entry point must be a function declaration or arrow function expression.`,
            )
          }

          entryPoint = firstDeclaration.id.name

          const exportDefaultDeclaration = path.node.body.find((statement) =>
            t.isExportDefaultDeclaration(statement),
          )

          if (!t.isExportDefaultDeclaration(exportDefaultDeclaration)) {
            throw new Error(
              `Your function ${entryPoint} was declared, but not exported. Please export your function ${entryPoint} as a default export.`,
            )
          }
          type = t.isFunctionExpression(firstDeclaration.init)
            ? 'FunctionDeclaration'
            : 'ArrowFunctionExpression'
          const paramKeys = getFunctionParams(firstDeclaration.init)

          params.push(...paramKeys)
        } else {
          throw new Error(
            `Your entry point must be a function declaration or arrow function expression.`,
          )
        }

        const expressionStatement = path.node.body.find((statement) =>
          t.isExpressionStatement(statement),
        )

        if (
          !t.isExpressionStatement(expressionStatement) ||
          !t.isCallExpression(expressionStatement.expression) ||
          !t.isIdentifier(expressionStatement.expression.callee)
        ) {
          throw new Error(
            `Your function ${entryPoint} was declared, but not called.`,
          )
        }

        if (entryPoint !== expressionStatement.expression.callee.name) {
          throw new Error(
            `Please call your function ${entryPoint} instead of ${expressionStatement.expression.callee.name}.`,
          )
        }

        if (!entryPoint) {
          entryPoint = path.scope.generateUidIdentifier('entryPoint').name
        }

        const args:
          | (string | number | boolean)[]
          | (string | number | boolean)[][] = []

        expressionStatement.expression.arguments.forEach((arg) => {
          const argValue = getCallFunctionArgs(arg)
          if (Array.isArray(argValue)) {
            ;(args as (string | number | boolean)[][]).push(argValue)
          } else {
            ;(args as (string | number | boolean)[]).push(argValue)
          }
        })

        path.traverse(
          {
            /**
             * We've already analyzed the entry point here, so we're only updating the
             * AST i.e. removing the node if it's an identifier, or updating it to a
             * variable declaration otherwise.
             */
            ExportDefaultDeclaration(path) {
              const { declaration } = path.node
              /**
               * If we're default exporting a variable name, remove the default export
               * altogether so we don't have duplicate bindings. Otherwise, replace it
               * with a VariableDeclaration.
               */
              if (t.isIdentifier(declaration)) {
                path.remove()
              } else {
                let expression = declaration as FunctionExpression
                if (t.isFunctionDeclaration(declaration)) {
                  expression = t.functionExpression(
                    declaration.id,
                    declaration.params,
                    declaration.body,
                  ) as FunctionExpression
                }
                if (entryPoint)
                  path.replaceWith(
                    createVariable(t, t.identifier(entryPoint), expression),
                  )
              }
            },
            FunctionDeclaration({ node }) {
              getParams(node.params).forEach((name) => this.declared.add(name))
            },
            ArrowFunctionExpression({ node }) {
              getParams(node.params).forEach((name) => this.declared.add(name))
            },
            FunctionExpression({ node }) {
              getParams(node.params).forEach((name) => this.declared.add(name))
            },
            VariableDeclarator({ node }) {
              const names = getNames(node.id)
              names.forEach((name) => this.declared.add(name))
            },
            DebuggerStatement(path) {
              const scope = Object.keys(path.scope.getAllBindings()).filter(
                (name) => this.declared.has(name),
              )
              path.replaceWith(
                createSnapshot(t, [
                  ...scope,
                  { line: String(path.node.loc?.start.line) },
                ]),
              )
            },
          },
          { declared: new Set() },
        )

        buildMetadata(t, path.node, {
          entryPoint,
          params,
          type,
          args,
        })
      },
    },
  }
}
