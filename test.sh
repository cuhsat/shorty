#!/usr/bin/env bash
curl -X POST "http://localhost/create?alias=test&url=hello"
curl -v "http://localhost/test"
