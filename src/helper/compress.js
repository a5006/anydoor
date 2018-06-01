const {createGzip, createDeflate} = require('zlib');//引用压缩模块;

//rs readStream
//req request
//res response
module.exports = (rs, req, res) => {
  const acceptEncoding = req.headers['accept-encoding'];
  if (!acceptEncoding || !acceptEncoding.match(/\b(gzip|deflate)\b/)) {
    return
  }else if(acceptEncoding.match(/\bgzip\b/)){
    res.setHeader('Content-Encoding','gzip');
    return rs.pipe(createGzip());
  }
  else if (acceptEncoding.match(/\deflate\b/)){
        res.setHeader('Content-Encoding', 'deflate');

        return rs.pipe(createDeflate());


  }


}
