import { Crypt } from "../snoopbot"

(async() => {
    let mysecret = 'test'
    console.log(Crypt.encrypt(mysecret))
})()