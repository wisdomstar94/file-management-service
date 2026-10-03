#!/bin/sh
# 컨테이너 기동 전에 마이그레이션을 적용하고 기본 데이터(시드)를 넣는다. 둘 다 여러 번 실행해도 안전하다.
set -e
cd /app/servers/database-manager
node /app/node_modules/typeorm/cli.js -d ./dist/data-source/data-source.js migration:run
node ./dist/scripts/run-seed/run-seed.js
