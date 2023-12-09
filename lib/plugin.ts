import {
  buildMetadata,
  createSnapshot,
  createVariable,
  getCallFunctionArgs,
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
        const callExpressionsList = path.node.body.filter(
          (statement) =>
            t.isExpressionStatement(statement) &&
            t.isCallExpression(statement.expression) &&
            t.isIdentifier(statement.expression.callee),
        )

        if (callExpressionsList.length === 0) {
          throw new Error(
            `Your program must call a function. Please call your function.`,
          )
        } else if (callExpressionsList.length > 1) {
          throw new Error(
            `Calling multiple functions is not allowed. You have ${callExpressionsList.length} calls.`,
          )
        }

        if (
          !t.isExpressionStatement(callExpressionsList[0]) ||
          !t.isCallExpression(callExpressionsList[0].expression) ||
          !t.isIdentifier(callExpressionsList[0].expression.callee)
        ) {
          throw new Error('Expression statement expected')
        }

        const args:
          | (string | number | boolean)[]
          | (string | number | boolean)[][] = []

        callExpressionsList[0].expression.arguments.forEach((arg) => {
          const argValue = getCallFunctionArgs(arg)
          if (Array.isArray(argValue)) {
            ;(args as (string | number | boolean)[][]).push(argValue)
          } else {
            ;(args as (string | number | boolean)[]).push(argValue)
          }
        })

        const entryPoint = callExpressionsList[0].expression.callee.name
        const params: string[] = []
        let type: 'Identifier' | 'FunctionDeclaration' | null = null

        let functionDeclaration = path.node.body.find(
          (statement) =>
            t.isFunctionDeclaration(statement) ||
            t.isExportDefaultDeclaration(statement),
        )

        let functionExpression = path.node.body.find((statement) =>
          t.isVariableDeclaration(statement),
        )

        const exportNamedDeclaration = path.node.body.find((statement) =>
          t.isExportNamedDeclaration(statement),
        )

        if (
          exportNamedDeclaration &&
          t.isExportNamedDeclaration(exportNamedDeclaration) &&
          t.isVariableDeclaration(exportNamedDeclaration.declaration)
        ) {
          functionExpression = exportNamedDeclaration.declaration
        } else if (
          exportNamedDeclaration &&
          t.isExportNamedDeclaration(exportNamedDeclaration) &&
          t.isFunctionDeclaration(exportNamedDeclaration.declaration)
        ) {
          functionDeclaration = exportNamedDeclaration.declaration
        }

        if (
          functionDeclaration &&
          (t.isFunctionDeclaration(functionDeclaration) ||
            t.isExportDefaultDeclaration(functionDeclaration))
        ) {
          type = 'FunctionDeclaration'
          const paramKeys = getFunctionParams(functionDeclaration)
          params.push(...paramKeys)
        } else if (functionExpression) {
          let firstDeclaration = null

          if (t.isVariableDeclaration(functionExpression)) {
            firstDeclaration = functionExpression.declarations[0]
          } else if (
            t.isExportNamedDeclaration(functionExpression) &&
            t.isVariableDeclaration(functionExpression.declaration)
          ) {
            firstDeclaration = functionExpression.declaration.declarations[0]
          }

          if (
            !firstDeclaration ||
            !t.isIdentifier(firstDeclaration.id) ||
            (!t.isFunctionExpression(firstDeclaration.init) &&
              !t.isArrowFunctionExpression(firstDeclaration.init))
          ) {
            throw new Error(
              `Your entry point must be a function declaration or arrow function expression.`,
            )
          }

          type = 'FunctionDeclaration'
          const paramKeys = getFunctionParams(firstDeclaration.init)

          params.push(...paramKeys)
        }

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
