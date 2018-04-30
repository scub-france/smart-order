#!/bin/bash
# wait-for-it.sh
# wait for Ganache cli to be initialized before launching Core contract

set -e

host="$1"
shift
port="$1"
shift
cmd="$@"

until $(nc -z $host $port); do
  >&2 echo "Ganache is unavailable - sleeping"
  sleep 1
done

>&2 echo "Ganache is up - executing startup"
exec $cmd