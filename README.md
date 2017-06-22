USS ![Build](https://img.shields.io/travis/cuhsat/uss.svg)
===
URL Shortener Service.

A very basic URL shortener service using a Base36 alphabet.

Usage
-----
```
$ npm start
```

API
===

Create
------
```
http://<server>/<alias>
```

Fetch
-----
```
http://<server>/create?url=<url>[&alias=<alias>]
```

License
=======
Licensed under the terms of the [MIT License](LICENSE).
