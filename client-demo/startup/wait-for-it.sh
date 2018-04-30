#!/bin/bash
# wait-for-it.sh
# wait for the core build files to be present before launching client demo

set -e

host="$1"
shift
port="$1"
shift
cmd="$@"

until $([ -e /opt/workdir/data/contracts/SmartOrder.json ]); do
  >&2 echo "Contracts are unavailable - sleeping"
  sleep 1
done

>&2 echo "Contracts are available - executing startup"
exec $cmd
