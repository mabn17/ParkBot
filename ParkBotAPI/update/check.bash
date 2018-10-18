#!/bin/bash

# Checks if the filesite has been updated by comparing
#    header response "Last-Modified" to a txt file

# If an update is needed it runs a python2.7 script 
#       which notifies the admin by sending an e-mail


line=$(head -n 1 last-modified.txt)
res=$(wget --server-response --spider https://www.karlskrona.se/link/94e28995fa1e4641becc8e61f7c4c439.aspx 2>&1 | grep -i Last-Modified)

if [ "$line" == "$res" ]
then
    echo "Inga ändringar har hänt"
else
    echo "Excel behöver uppdateras, ändrar senaste datum i last-modified.txt"
    echo "$res" > last-modified.txt
    $(./main.py > /dev/null 2>&1)
    echo "E-mail notifikation har skickats"
fi