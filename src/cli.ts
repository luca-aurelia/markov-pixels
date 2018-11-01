import * as path from 'path'
import Shape from './types/Shape'

const parseInt = (s: string): number => global.parseInt(s, 10)

export enum ArgumentTypes {
  string = 'string',
  shape = 'shape'
}

const parse = {
  string(arg: string): string {
    return arg
  },
  shape(arg: string): Shape {
    const split = arg.split('x').map(parseInt)
    const width = split[0]
    const height = split[1]
    return [width, height]
  }
}

const cli = async (main: Function, fileNameWhereCliWasCalled: string, argTypes: ArgumentTypes[]) => {
  const [executedScriptPath, ...args] = process.argv.slice(1)
  const executedScript = path.parse(executedScriptPath).name
  const scriptName = path.basename(fileNameWhereCliWasCalled).replace('.js', '').replace('.ts', '')
  const wasCalledFromCommandLine = executedScript === scriptName

  if (wasCalledFromCommandLine) {
    if (args.length !== main.length) {
      throw new Error(
        `Wrong number of arguments. Got ${args.length} but expected ${main.length}.`
      )
    }
    if (argTypes.length !== main.length) {
      throw new Error(
        `cli received the wrong number of argTypes. argTypes.length should equal main's arity. Got ${argTypes.length} but expected ${main.length}.`
      )
    }

    const parsedArgs = args.map((arg, i) => {
      const type = argTypes[i]
      const parser = parse[type]
      if (!parser) throw new Error(`Unrecognized argument type ${type}`)
      return parser(arg)
    })

    await main(...parsedArgs)
  }
}

export default cli
