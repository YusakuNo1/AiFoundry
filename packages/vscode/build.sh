mkdir -p node_modules/aifoundry-vscode-shared
cp -r ../../node_modules/aifoundry-vscode-shared/* node_modules/aifoundry-vscode-shared
rm -rf node_modules/aifoundry-vscode-shared/node_modules

mkdir -p node_modules/rxjs
cp -r ../../node_modules/rxjs/* node_modules/rxjs
rm -rf node_modules/rxjs/node_modules

vsce package

rm -rf node_modules/aifoundry-vscode-shared
rm -rf node_modules/rxjs
