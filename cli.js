const path = require('path')

const parseInt = x => global.parseInt(x, 10)

const parse = {
  string (arg) {
    return arg
  },
  dimensions (arg) {
    return arg.split('x').map(parseInt)
  }
}

const cli = async (main, fileNameWhereCliWasCalled, argTypes) => {
  const [executedScriptPath, ...args] = process.argv.slice(1)
  const executedScript = path.parse(executedScriptPath).name
  const scriptName = path.basename(fileNameWhereCliWasCalled).replace('.js', '')
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

module.exports = cli
