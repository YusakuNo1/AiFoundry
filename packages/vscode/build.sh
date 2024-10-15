root_package_array=( "aifoundry-vscode-shared" "aifoundry-server-js" "rxjs" "uuid", "marked" "express" "debug" )
serverjs_package_array=( "@langchain/community" "commander" "dotenv" "ws" )

for i in "${root_package_array[@]}"
do
    mkdir -p node_modules/$i
    cp -r ../../node_modules/$i/* node_modules/$i
    rm -rf node_modules/$i/node_modules
done

for i in "${serverjs_package_array[@]}"
do
    mkdir -p node_modules/$i
    cp -r ../server-js/node_modules/$i/* node_modules/$i
    rm -rf node_modules/$i/node_modules
done

# Colors
IRed='\033[0;91m'         # Red
IYellow='\033[0;93m'      # Yellow
IGreen='\033[0;92m'       # Green

# TODO: the VSCE is from https://github.com/microsoft/vscode-vsce, but removed dedup related code, fix it later to use the official one
VSCE_HOME=/Users/weiwu/Workspace/OpenSource/vscode-vsce
if [ -z "$VSCE_HOME" ]; then
    echo "$IRed Error: please set VSCE_HOME to the path of the vsce tool."
    echo "$IYellow e.g. if 'vscode-vsce' is in '/Users/david/vscode-vsce', set 'VSCE_HOME=/Users/david/vscode-vsce'"
else
    $VSCE_HOME/vsce package
fi

for i in "${root_package_array[@]}"
do
    rm -rf node_modules/$i
done
