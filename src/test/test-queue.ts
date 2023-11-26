import chalk from 'chalk'
import { Logger, Queue } from '../snoopbot'

(async() => {
    let fn = (num: number) => {
        if(num == 1) {
            console.time('Executing task #1')
            for(let i = 0; i < 1_000_000_000; i++) {}
            console.timeEnd('Executing task #1')

            console.log('Executed task #1 with lengthy process')
            return
        }

        console.log(`Executed task #${num}`)
    }

    let queue = new Queue(1, "Test Queue")
    
    for(let num = 1; num <= 11; num++) {
        console.log('Enqueued task #' + num)
        queue.enqueue(async() => fn(num))
    }
})()