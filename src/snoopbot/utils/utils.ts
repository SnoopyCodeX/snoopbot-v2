/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2023, SnoopyCodeX
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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