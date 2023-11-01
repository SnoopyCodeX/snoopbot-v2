/**
 * Matches a string based on the provided
 * regular expression pattern
 * 
 * @param pattern Regex pattern
 * @param str The string to match the pattern with
 * @returns Array<string>
 */
const multilineRegex = (pattern: RegExp, str: string): Array<string> => {
    const regex = pattern
    const matches: Array<string> = []
    let match: RegExpExecArray | null;

    while((match = regex.exec(str)) !== null) {
        if(match.index === regex.lastIndex)
            regex.lastIndex++

        match.forEach((_match) => matches.push(_match))
    }

    return matches
}

/**
 * @param pipes List of pipes
 * @param args List of arguments for each pipes
 * @returns callback
 */
const pipeline = (pipes: Array<any>, ...args: any) => {
    const callbacks = pipes
        .slice()
        .reverse()
        .reduce((next, pipe) => (...args: any) => typeof pipe(next) === "function" ? pipe(next)(...args) : pipe(...args), (n: any) => n)

    return callbacks(...args)
}

/**
 * Gets the type of the object
 * 
 * @param object Object to get the type of
 * @returns Name type of the object
 */
const getType = (object: any) => {
    return Object.prototype.toString.call(object).slice(8, -1)
}

export {
    multilineRegex,
    pipeline,
    getType
}