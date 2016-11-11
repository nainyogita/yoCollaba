import path from 'path';
import fs from 'fs';
import BusBoy from 'busboy';

export function uploadFile(req, res) {


  var busboy = new BusBoy({
    headers: req.headers
  });
  req.pipe(busboy);
  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {

    var saveTo = path.join('./server/uploads/', path.basename(filename));

    file.pipe(fs.createWriteStream(saveTo));
  });
  busboy.on('finish', function () {
    res.writeHead(200, {
      'Connection': 'close'
    });
    res.end("File Uploaded Successfully");
  });
}
