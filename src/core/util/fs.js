import fs from "fs";

export const readFilePromise = (filePathWithName, encoding = "utf8") =>
  new Promise((resolve, reject) => {
    fs.readFile(filePathWithName, encoding, (err, content) => {
      err ? reject(err) : resolve(content);
    });
  });

export const readDirPromise = (path, encoding = "utf8") =>
  new Promise((resolve, reject) => {
    fs.readdir(path, encoding, (err, files) => {
      err ? reject(err) : resolve(files);
    });
  });

export const readAllFilesInDir = (
  path,
  encoding = "utf8",
  fileEncoding = "utf8"
) =>
  readDirPromise(path, encoding).then(files =>
    Promise.all(files.map(file => readFilePromise(path + file, fileEncoding)))
  );

export const mkdirPromise = (path, mode = "0o755") =>
  new Promise((resolve, reject) => {
    fs.mkdir(path, mode, err => {
      err ? reject(err) : resolve();
    });
  });

// To make a directory if it doesn't exist,
// just catch the error on mkdir silently
// if the error is that it exists already
// TODO throw an error if the dir exists and the mode is wrong
export const mkdirIfNotExist = (path, mode = "0o755") =>
  Promise.resolve().then(() =>
    mkdirPromise(path, mode).catch(err => {
      if (err.code === "EEXIST") throw err;
      else return null;
    })
  );
