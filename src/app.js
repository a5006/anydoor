const http = require('http');
const conf = require('./config/defaultConfig');
const chalk = require('chalk');
const path = require('path');
//引用router
const route = require('./helper/router');

//req 就是request res就是response
const server = http.createServer((req, res) => {
  const filePath = path.join(conf.root, req.url);
  route(req, res, filePath)
})

server.listen(conf.port, conf.hostname, () => {
  let mes = `server has been run,${conf.hostname}:${conf.port}`;
  console.warn(`${chalk.green(mes)}`)
})
