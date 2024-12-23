# Pre-release scripts
cd ../vscode-ui
npm i
npm run release
cd ../vscode

# Colors
IRed='\033[0;91m'         # Red
IYellow='\033[0;93m'      # Yellow
IGreen='\033[0;92m'       # Green

# Use specitial version of vsce: https://github.com/YusakuNo1/vscode-vsce/tree/main.aifoundry
# Setup VSCE_HOME from you CLI
if [ -z "$VSCE_HOME" ]; then
    echo "$IRed Error: please set VSCE_HOME to the path of the vsce tool."
    echo "$IYellow e.g. if 'vscode-vsce' is in '/Users/david/vscode-vsce', set 'VSCE_HOME=/Users/david/vscode-vsce'"
else
    $VSCE_HOME/vsce package --follow-symlinks
fi
