# DraftApp

The client was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.1.3.
The server is a node express application.

## Local Development Setup
Install all dependencies:
```
cd Server
npm install
cd ../client
npm install
cd ..
```

Create the config.json file in the Server folder:
```
cd Server
cp config.json.template config.json
vim config.json
cd ..
```
the imgur key is only necessary for generating tabletop images. All you really need is the Mongodb uri.

Now you can navigate into the Server and Client folders respectively and execute `npm run start` to being running the server.
```
cd Server
npm run start

cd client
npm run start
```

Then navigate to http://localhost:4200 in a brower and you should be able to use the application.
