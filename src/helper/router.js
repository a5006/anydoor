const fs = require('fs');
const {
  promisify
} = require('util');
const stat = promisify(fs.stat);
const path = require('path')
const readdir = promisify(fs.readdir);
//如果是使用require的话就可以放心使用想怼路径,在require ,path总是相对于当前文件夹
const config = require('../config/defaultConfig');
const Handlebars = require('handlebars');
const tplPath = path.join(__dirname, '../template/dir.tpl')
//同步方法
const source = fs.readFileSync(tplPath)
//souce 读出来的是Buffer
const template = Handlebars.compile(source.toString());
const mime = require('./mime');
const compress = require('./compress')
const range = require('./range')
const isFresh = require('./cache')
module.exports = async function (req, res, filePath) {
  try {
    //必须用await调用
    const stats = await stat(filePath);
    if (stats.isFile()) {
      const contentType = mime(filePath);
      if (isFresh(stats, req, res)) {
        res.statusCode = 304;
        res.end();
        return;
      }
      res.setHeader('Content-type', contentType);
      res.statusCode = 200;
      let rs;
      const {
        code,
        start,
        end
      } = range(stats.size, req, res);
      if (code === 200) {
        rs = fs.createReadStream(filePath)
      } else {
        rs = fs.ReadStream(filePath, {
          start,
          end
        })
      }
      if (filePath.match(config.compress)) {
        rs;
        rs = compress(rs, req, res)

      }
      // 文件流，处理高并发就是靠这个
      fs.createReadStream(filePath).pipe(res);
    } else if (stats.isDirectory()) {
      const files = await readdir(filePath);

      res.setHeader('Content-type', 'text/html');
      const dir = path.relative(config.root, filePath);
      const data = {
        //读取文件名
        title: path.basename(filePath),
        dir: dir ? `/${dir}` : '',
        //获取每一项的文件，扩展名
        files: files.map(file => {
          return {
            file,
            icon: mime(file)
          }
        })
      }
      res.end(template(data));
    }
  } catch (ex) {
    console.error(ex);
    res.statusCode = 404;
    res.setHeader('Content-type', 'text/plain');
    res.end(`${filePath} is not a directory or file`);
  }

}
