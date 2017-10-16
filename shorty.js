#!/usr/bin/env node
/**
 * Copyright (c) 2017 Christian Uhsat <christian@uhsat.de>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
var base62  = require('base62');
var express = require('express');
var redis   = require('redis');
var config  = require('./config.json');

function findKey(key, redis, callback, index) {
  if (!key) {
    key = base62.encode(index);

    redis.EXISTS(key, function exists(error, exists) {
      if (exists === 1) {
        findKey(null, redis, callback, index + 1);
      } else {
        callback(key);
      }
    });
  } else {
    callback(key);
  }
}

function setUrl(redis, request, response) {
  var key = request.query.alias;
  var url = request.query.url || '';

  findKey(key, redis, function findKey(key) {
    redis.GET(key, function get(error, value) {
      if (error) {
        response.status(500).send();
      } else if (value) {
        response.status(200).send('Alias not available');
      } else {
        redis.SET(key, url, function set(error) {
          if (error) {
            response.status(500).send();
          } else {
            response.status(200).send("Created alias " + key);
          }
        });
      }
    });
  }, 0);
}

function getUrl(redis, request, response) {
  var key = request.params.alias || '';

  redis.GET(key, function get(error, value) {
    if (error) {
      response.status(500).send();
    } else if (!value) {
      response.status(404).send();
    } else {
      response.redirect(301, value);
    }
  });
}

try {
  var app = express();
  var redis = redis.createClient(process.env.REDIS_URL || config.redis);

  app.post(/^create(\..+)?$/, function post(request, response) {
    setUrl(redis, request, response);
  });

  app.get('/:alias', function get(request, response) {
    getUrl(redis, request, response);
  });

  var server = app.listen(config.port);

  console.log('Ready');
} catch (error) {
  console.error(error.stack || error);
  process.exit(1);
}
