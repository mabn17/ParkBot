
line=$(head -n 1 last-modified.txt)
res=$(wget --server-response --spider https://www.karlskrona.se/link/94e28995fa1e4641becc8e61f7c4c439.aspx 2>&1 | grep -i Last-Modified)

if [ "$line" == "$res" ]
then
    echo "Inga ändringar har hänt"
else
    echo "Excel behöver uppdateras, ändrar senaste datum i last-modified.txt"
    echo "$res" > last-modified.txt
fi