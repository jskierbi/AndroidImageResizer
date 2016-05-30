var fs = require('fs');
var path = require('path');
var imagemagick = require('imagemagick');
var readline = require('readline');

var sizeNames = ['xxxhdpi', 'xxhdpi', 'xhdpi', 'hdpi', 'mdpi', 'ldpi'];
var multipliers = [4.0, 3.0, 2.0, 1.5, 1, 0.75];

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var imageFiles = [];

var currentImageSize;
var smallestImageSize;

function askUserForCurrentSize() {
  console.log("Input images are xxhdpi");
  currentImageSize = "xxhdpi";
  askUserForSmallestSize();
  // rl.question("Enter current image size [xxxhdpi, xxhdpi, xhdpi, hdpi, mdpi, ldpi]: ",
  // function(inputString) {
  //   currentImageSize = inputString;
  //   askUserForSmallestSize();
  // });
}

function askUserForSmallestSize() {
  console.log("Smallest images are hdpi");
  smallestImageSize = "hdpi"
  makeDirectories();
  // rl.question("Enter smallest desired image size [xxxhdpi, xxhdpi, xhdpi, hdpi, mdpi, ldpi]: ",
  // function(inputString) {
  //   smallestImageSize = inputString;
  //   makeDirectories();
  //   rl.close();
  // });
}

function makeDirectories() {
  console.log("Making directories...");
  var startIndex = sizeNames.indexOf(currentImageSize);
  var endIndex = sizeNames.indexOf(smallestImageSize);
  for (var i = startIndex; i <= endIndex; i++) {
    deleteFolderRecursive('drawable-'+sizeNames[i]);
    fs.mkdirSync('drawable-'+sizeNames[i]);
  }
  populateImageFiles();
}

function populateImageFiles() {
  console.log("Finding image files...");
  var currentDirectory = process.cwd();
  var allFiles = fs.readdirSync(currentDirectory);
  for (var i = 0; i < allFiles.length; i++) {
    var extname = path.extname(allFiles[i]);
    if (extname == '.jpg' || extname == '.jpeg' || extname == '.png') {
      imageFiles.push(allFiles[i]);
    }
    if (i == allFiles.length - 1) {
      console.log("Resizing all images...");
      resize(0, 0);
    }
  }
}

function resize(fileIndex, sizeIndex) {
  imagemagick.convert(
      [imageFiles[fileIndex], '-resize', getPercentString(sizeNames[sizeIndex]),
      getPath(fileIndex, sizeIndex)],
      function() {
        if (sizeIndex < sizeNames.length) {
          resize(fileIndex, sizeIndex + 1);
        } else if (fileIndex < imageFiles.length) {
          resize(fileIndex + 1, 0);
        } else {
          console.log("Done.")
          process.exit()
        }
      });
}

function getPath(fileIndex, sizeIndex) {
  return 'drawable-'+sizeNames[sizeIndex] + '/' + imageFiles[fileIndex];
}

function getPercentString(sizeName) {
  return getPercent(sizeName) * 100 + '%';
}

function getPercent(sizeName) {
  return multipliers[sizeNames.indexOf(sizeName)] / multipliers[sizeNames.indexOf(currentImageSize)];
}

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

askUserForCurrentSize();
