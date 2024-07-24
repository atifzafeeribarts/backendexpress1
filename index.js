const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const file_directory = path.join(__dirname, 'files/');

app.get('/', (req, res) => {
  res.render('index');
});
app.get('/allfiles', (req, res) => {
  fs.readdir(file_directory, function (err, files) {
    var filedata = [];
    //handling error
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    } else {
      /** file data */
      let fileReadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          fs.readFile(path.join(file_directory, file), { encoding: 'utf-8' }, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve({ filename: file, data: data });
            }
          });
        });
      });
      Promise.all(fileReadPromises).then((results) => {
        filedata = results;

        res.render('allfiles', { allfiles: filedata });
      }).catch((err) => {
        console.log(err);
        res.status(500).send('Error reading files');
      });
    }
  });

});

app.post('/createfile', (req, res) => {
  let fileName = req.body.filename;
  let content = req.body.content;

  if (!fileName || !content) {
    res.json("Filename and content are required");
    return;
  }

  // Ensure the directory exists
  fs.mkdir(file_directory, { recursive: true }, (err) => {
    if (err) {
      console.log(err);
      res.json("Error creating directory");
      return;
    }

    fs.writeFile(path.join(file_directory, fileName), content, function (error) {
      if (error) {
        console.log(error);
        res.json("Error creating file");
      } else {
        res.json("Created file");
      }
    });
  });
});

app.post('/updatefile', (req, res)=>{
  let fileName = req.body.filename;
  let content = req.body.content;
  fs.writeFile(file_directory + fileName, content, function (err) {
    if (err) {
      res.json("Error writing file");
    }else{
      res.json("Updated file");
    }
  });
});

app.post('/allfiles/:name', (req, res)=>{
  res.send('as'+ req.params.name);
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
