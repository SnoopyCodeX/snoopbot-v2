import { Crypt } from "../snoopbot"

(async() => {
    const mysecret = 'test'
    console.log(Crypt.encrypt(mysecret))
})()