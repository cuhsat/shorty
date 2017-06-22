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
var express = require('express');
var redis = require('redis');

var config = {
  "server": 80,
  "redis": 6379
};

function findKey(key, redis, callback, index) {
  if (key) {
    callback(key.toLowerCase());
  } else {
    key = index.toString(36);

    redis.EXISTS(key, function exists(error, exists) {
      if (exists === 1) {
        findKey(null, redis, callback, index + 1);
      } else {
        callback(key);
      }
    });
  }
}

function createUrl(redis, request, response) {
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
            response.status(200).send("Created " + key);
          }
        });
      }
    });
  }, 0);
}

function fetchUrl(redis, request, response) {
  var key = request.params.alias || '';

  redis.GET(key.toLowerCase(), function get(error, value) {
    if (error) {
      response.status(500).send();
    } else if (!value) {
      response.status(404).send();
    } else {
      response.redirect(value);
    }
  });
}

try {
  var app = express();

  var redis = redis.createClient(config.redis);

  app.post('/create', function post(request, response) {
    createUrl(redis, request, response);
  });

  app.get('/:alias', function get(request, response) {
    fetchUrl(redis, request, response);
  });

  var server = app.listen(process.argv[2] || config.server);

  console.log('Ready');
} catch (error) {
  console.error(error.stack || error);
  process.exit(1);
}
