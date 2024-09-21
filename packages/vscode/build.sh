array=( "aifoundry-vscode-shared" "rxjs" "uuid" )

for i in "${array[@]}"
do
    mkdir -p node_modules/$i
    cp -r ../../node_modules/$i/* node_modules/$i
    rm -rf node_modules/$i/node_modules
done

# Colors
IRed='\033[0;91m'         # Red
IYellow='\033[0;93m'      # Yellow
IGreen='\033[0;92m'       # Green

# TODO: the VSCE is from https://github.com/microsoft/vscode-vsce, but removed dedup related code, fix it later to use the official one
VSCE_HOME=
if [ -z "$VSCE_HOME" ]; then
    echo "$IRed Error: please set VSCE_HOME to the path of the vsce tool."
    echo "$IYellow e.g. if 'vscode-vsce' is in '/Users/david/vscode-vsce', set 'VSCE_HOME=/Users/david/vscode-vsce'"
else
    $VSCE_HOME/vsce package
fi

for i in "${array[@]}"
do
    rm -rf node_modules/$i
done
