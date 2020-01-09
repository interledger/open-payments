import { createServer } from 'http'
import { Duplex } from 'stream'
import { IlpPrepare, IlpReply } from 'ilp-packet'

const server = createServer((req, res) => {

  if((req.url as string).indexOf('temp') > 0) {
    console.log('Hello')
    res.statusCode = 200
    res.write("Hello World")
    res.end()  
  } else {
    console.log('Redirecting')
    res.statusCode = 201
    res.setHeader('location', 'http://localhost:8080/temp')
    res.end()  
  }
})
server.listen(8080)


