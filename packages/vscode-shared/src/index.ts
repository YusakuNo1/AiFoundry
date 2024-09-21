import * as types from './types';
import * as consts from './consts';
export { consts, types };

function doSthInShared() {
    console.log('doSthInShared');
}
export { doSthInShared };
