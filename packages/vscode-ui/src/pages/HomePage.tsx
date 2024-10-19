import React from 'react';
import { Label } from '@fluentui/react-components';
import { getTextColor } from '../theme/themes';
import type { VSCodeInterface } from '../types';


type Props = {
    vscode: VSCodeInterface;
}
const HomePage = (props: Props) => {
    const textColor = React.useMemo(() => getTextColor(), []);
    return (<>
            <Label style={{ color: textColor, paddingLeft: "8px" }} size='large' weight='semibold'>Welcome to AI Foundry!</Label>
    </>);
};

export default HomePage;
