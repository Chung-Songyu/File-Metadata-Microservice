var express = require('express');
var app = express();

// Add multer to handle file uploading
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/")
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toDateString() + " - " + file.originalname)
  }
})
var upload = multer({storage: storage});

app.use(express.static('public'))
app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/fileanalyse', upload.single("upfile"), (req, res) => {
  res.json({"name": req.file.originalname, "type": req.file.mimetype, "size": req.file.size});
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
