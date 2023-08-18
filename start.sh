node index.js --color --loop_execution;

while [ $? == 1 ];
do
    node index.js --color --loop_execution;
done;