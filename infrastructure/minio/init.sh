#!/bin/sh
mc alias set local http://minio:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
mc mb local/scipilot --ignore-existing
