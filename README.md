# local gigipan images

## set up
install dependancies
```sh
$ npm i
```

run the server
```sh
$ npm run server-dev
```

open example html file in browser
```sh
$ open example/example.html
```

## explanation
- all requests to gigapan have been routed to localhost:4000 (see example/gigapan_core_min.js#L1994)
- in the express server we check to see if the image requested has been downloaded and saved before
- if it has, send it right away to the client
- if not fetch it from gigapan servers and download it to this server for future requests
