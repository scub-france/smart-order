#!/bin/bash
# wait-for-it.sh
# wait for the core build files to be present before launching client demo

set -e

cmd="$@"

until $([ -e /opt/workdir/core-contract/build/contracts/SmartOrder.json ]); do
  >&2 echo "Contracts are unavailable - sleeping"
  sleep 1
done

>&2 echo "Contracts are available - executing startup"
exec $cmd
