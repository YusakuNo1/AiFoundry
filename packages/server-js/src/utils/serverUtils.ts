import { OptionValues, program } from 'commander';

namespace ServerUtils {
    export function getArgs(): OptionValues {
        program
            .option('--localserver')
            .parse(process.argv);
        return program.opts();      
    }
}

export default ServerUtils;
