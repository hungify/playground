import {
  type ArgumentPlaceholder,
  type ArrowFunctionExpression,
  type ExportDefaultDeclaration,
  type Expression,
  type FunctionDeclaration,
  type FunctionExpression,
  type Identifier,
  type JSXNamespacedName,
  type LVal,
  type Pattern,
  type Program,
  type RestElement,
  type SpreadElement,
  identifier,
  isArrayExpression,
  isArrowFunctionExpression,
  isAssignmentPattern,
  isBooleanLiteral,
  isExportDefaultDeclaration,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isNumericLiteral,
  isObjectProperty,
  isRestElement,
  isStringLiteral,
  isUnaryExpression,
  objectExpression,
  objectProperty,
} from '@babel/types'
import {
  ARGUMENTS,
  type Babel,
  ENTRY_POINT,
  META,
  PARAMS,
  SNAPSHOTS,
} from './types'

export const getFunctionDeclarationIdentifierName = (
  func: FunctionDeclaration | ExportDefaultDeclaration,
) => {
  if (isFunctionDeclaration(func)) {
    return func.id?.name
  } else if (
    isExportDefaultDeclaration(func) &&
    isFunctionDeclaration(func.declaration)
  ) {
    return func.declaration.id?.name
  } else {
    throw new Error('Unknown node type')
  }
}

export const getNames = (node: LVal) => {
  if (isIdentifier(node)) {
    return [node.name]
  }
  if (isAssignmentPattern(node)) {
    throw new Error('Assignment patterns are not supported')
  } else if (isRestElement(node)) {
    throw new Error('Rest elements are not supported')
  } else if (isObjectProperty(node)) {
    throw new Error('Object destructuring is not supported')
  }
  throw new Error('Unknown node type')
}

export const getFunctionParams = (
  declareFunction:
    | FunctionDeclaration
    | ExportDefaultDeclaration
    | FunctionExpression
    | ArrowFunctionExpression,
) => {
  if (
    isFunctionDeclaration(declareFunction) ||
    isFunctionExpression(declareFunction) ||
    isArrowFunctionExpression(declareFunction)
  ) {
    return declareFunction.params.flatMap((node) => getNames(node))
  } else if (
    isExportDefaultDeclaration(declareFunction) &&
    isFunctionDeclaration(declareFunction.declaration)
  ) {
    return declareFunction.declaration.params.flatMap((node) => getNames(node))
  } else {
    throw new Error('Unknown node type')
  }
}

export const getParams = (
  params: Array<Identifier | Pattern | RestElement>,
) => {
  return params.flatMap((node) => getNames(node))
}

export const getCallFunctionArgs = (
  element:
    | ArgumentPlaceholder
    | JSXNamespacedName
    | SpreadElement
    | Expression
    | null,
): string | number | boolean | (string | number | boolean)[] => {
  if (isIdentifier(element)) {
    return element.name
  } else if (
    isStringLiteral(element) ||
    isNumericLiteral(element) ||
    isBooleanLiteral(element)
  ) {
    return element.value
  } else if (isArrayExpression(element)) {
    return element.elements.map((el) => {
      if (isStringLiteral(el) || isNumericLiteral(el) || isBooleanLiteral(el)) {
        return el.value
      } else if (isUnaryExpression(el) && isNumericLiteral(el.argument)) {
        return -el.argument.value
      } else {
        throw new Error('Nested array expressions are not supported')
      }
    })
  } else {
    throw new Error(`Unsupported argument type: ${element?.type}`)
  }
}

export const createObjectExpression = (entries: string[][]) => {
  return objectExpression(
    entries.map(([key, val]) => {
      if (key && val) return objectProperty(identifier(key), identifier(val))
      else throw new Error('Invalid entry')
    }),
  )
}

export const createVariable = (
  t: Babel['types'],
  id: Identifier,
  init?: FunctionExpression | ArrowFunctionExpression | Expression,
) => {
  return t.variableDeclaration('const', [t.variableDeclarator(id, init)])
}

export const createSnapshot = (
  t: Babel['types'],
  scope: Array<string | { line: string }>,
) => {
  const parsedScope = scope
    .filter((scope) =>
      typeof scope === 'string' ? scope !== SNAPSHOTS : scope,
    )
    .map((stringOrVal) => {
      if (typeof stringOrVal === 'string') {
        return [stringOrVal, stringOrVal]
      } else {
        const value = Object.entries(stringOrVal)[0]
        return value ? [value[0], value[1]] : []
      }
    })
  return t.expressionStatement(
    t.callExpression(
      t.memberExpression(t.identifier(SNAPSHOTS), t.identifier('push')),
      [createObjectExpression(parsedScope)],
    ),
  )
}

// Node builders
export const buildMetadata = (
  t: Babel['types'],
  program: Program,
  data: {
    entryPoint: string
    params: string[]
    type:
      | 'Identifier'
      | 'FunctionDeclaration'
      | 'ArrowFunctionExpression'
      | null
    args: (string | number | boolean)[] | (string | number | boolean)[][]
  },
) => {
  const params = t.identifier('__params')
  const paramsArray = data.params.map((name) =>
    t.stringLiteral(name),
  ) as Expression[]
  program.body.push(createVariable(t, params, t.arrayExpression(paramsArray)))

  const entryPoint = t.identifier('__entryPoint')
  program.body.push(
    createVariable(t, entryPoint, t.identifier(data.entryPoint)),
  )

  const args = t.identifier('__arguments')
  program.body.push(
    createVariable(
      t,
      args,
      t.arrayExpression(
        data.args.map((arg) => {
          if (Array.isArray(arg)) {
            return t.arrayExpression(
              arg.map((el) => {
                if (typeof el === 'number') {
                  return t.numericLiteral(el)
                } else if (typeof el === 'boolean') {
                  return t.booleanLiteral(el)
                } else {
                  return t.stringLiteral(el)
                }
              }),
            )
          } else if (typeof arg === 'object') {
            return t.objectExpression(
              Object.entries(arg).map(([key, val]) =>
                t.objectProperty(
                  t.stringLiteral(key),
                  typeof val === 'number'
                    ? t.numericLiteral(val)
                    : t.stringLiteral(val as string),
                ),
              ),
            )
          } else if (typeof arg === 'number') {
            return t.numericLiteral(arg)
          } else if (typeof arg === 'boolean') {
            return t.booleanLiteral(arg)
          } else {
            return t.stringLiteral(arg)
          }
        }),
      ),
    ),
  )

  const meta = t.identifier(META)
  program.body.push(
    createVariable(
      t,
      meta,
      createObjectExpression(
        [PARAMS, ENTRY_POINT, SNAPSHOTS, ARGUMENTS].map((name) => [
          name.slice(2),
          name,
        ]),
      ),
    ),
    t.returnStatement(meta),
  )
}
