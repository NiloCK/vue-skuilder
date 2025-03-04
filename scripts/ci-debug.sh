#!/bin/bash

echo "==== DOCKER CONTAINER STATUS ===="
docker ps -a

echo -e "\n==== COUCHDB CONTAINER LOGS ===="
docker logs skuilder-test-couch

echo -e "\n==== NETWORK INTERFACES ===="
ip addr

echo -e "\n==== LISTENING PORTS ===="
netstat -tulpn || ss -tulpn

echo -e "\n==== COUCHDB CONNECTION TEST ===="
curl -v http://localhost:5984 || echo "Curl failed with status $?"

echo -e "\n==== TESTING DOCKER INTERNAL NETWORK ===="
docker exec skuilder-test-couch curl -v http://localhost:5984 || echo "Internal curl failed with status $?"

echo -e "\n==== COUCHDB CONFIGURATION ===="
docker exec skuilder-test-couch cat /opt/couchdb/etc/local.ini || echo "Config check failed"

echo -e "\n==== ENV VARIABLES ===="
printenv | grep -i couch
