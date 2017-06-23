Shorty ![Build](https://img.shields.io/travis/cuhsat/shorty.svg)
======
A very basic URL shortener using a Base62 alphabet.

Usage
-----
```
$ npm start
```

REST API
--------
The RESTful API is specified in [API.raml](api.raml).

Examples
--------
```
POST http://localhost/create?url=xyz&alias=test
```
```
GET http://localhost/test
```

License
=======
Licensed under the terms of the [MIT License](LICENSE).
