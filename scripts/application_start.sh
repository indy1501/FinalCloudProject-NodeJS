#!/bin/bash

# Stop all servers and start the server as a daemon
forever stopall
forever start /home/ubuntu/EventSync-app/index.js