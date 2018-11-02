"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const parseInt = (s) => global.parseInt(s, 10);
var ArgumentTypes;
(function (ArgumentTypes) {
    ArgumentTypes["string"] = "string";
    ArgumentTypes["shape"] = "shape";
})(ArgumentTypes = exports.ArgumentTypes || (exports.ArgumentTypes = {}));
const parse = {
    string(arg) {
        return arg;
    },
    shape(arg) {
        const split = arg.split('x').map(parseInt);
        const width = split[0];
        const height = split[1];
        return [width, height];
    }
};
const cli = async (main, fileNameWhereCliWasCalled, argTypes) => {
    const [executedScriptPath, ...args] = process.argv.slice(1);
    const executedScript = path.parse(executedScriptPath).name;
    const scriptName = path.basename(fileNameWhereCliWasCalled).replace('.js', '').replace('.ts', '');
    const wasCalledFromCommandLine = executedScript === scriptName;
    if (wasCalledFromCommandLine) {
        if (args.length !== main.length) {
            throw new Error(`Wrong number of arguments. Got ${args.length} but expected ${main.length}.`);
        }
        if (argTypes.length !== main.length) {
            throw new Error(`cli received the wrong number of argTypes. argTypes.length should equal main's arity. Got ${argTypes.length} but expected ${main.length}.`);
        }
        const parsedArgs = args.map((arg, i) => {
            const type = argTypes[i];
            const parser = parse[type];
            if (!parser)
                throw new Error(`Unrecognized argument type ${type}`);
            return parser(arg);
        });
        await main(...parsedArgs);
    }
};
exports.default = cli;
