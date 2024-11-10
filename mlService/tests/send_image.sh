#!/bin/bash

curl -X POST http://localhost:5000/detect \
    -H "Content-Type: application/octet-stream" \
    --data-binary @test_image.jpg