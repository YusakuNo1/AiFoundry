import * as types from './types';
import * as consts from './consts';
import AifUtils from './utils/AifUtils';
export { AifUtils, consts, types };

function doSthInShared() {
    console.log('doSthInShared');
}
export { doSthInShared };
