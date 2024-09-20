array=( "aifoundry-vscode-shared" "rxjs" "uuid" )

for i in "${array[@]}"
do
    echo "Copying $i"
    mkdir -p node_modules/$i
    cp -r ../../node_modules/$i/* node_modules/$i
    rm -rf node_modules/$i/node_modules
done

# TODO: the VSCE is from https://github.com/microsoft/vscode-vsce, but removed dedup related code, fix it later to use the official one
../../scripts/vsce/vsce package

for i in "${array[@]}"
do
    echo "Deleting $i"
    rm -rf node_modules/$i
done
