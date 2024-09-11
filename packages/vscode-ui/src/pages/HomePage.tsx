import React from 'react';
import { useSelector } from 'react-redux';
import type { types } from 'aifoundry-vscode-shared';
import { consts } from 'aifoundry-vscode-shared';
import { RootState } from '../store/store';
import { DockerStatusRow, LmStatusRow } from './HomePageRows';
import type { VSCodeInterface } from '../types';


type Props = {
    vscode: VSCodeInterface;
}
const HomePage = (props: Props) => {
    const systemMenuItemMap = useSelector((state: RootState) => state.serverData.systemMenuItemMap);
    const menuItemList = Object.values(systemMenuItemMap).sort((a, b) => a.weight - b.weight);
    const serverStatus = React.useMemo(() => {
        const dockerSystemMenuItem = systemMenuItemMap[consts.DOCKER_SERVER_ID] as types.api.DockerSystemMenuItem;
        return dockerSystemMenuItem?.serverStatus ?? "unavailable";
    }, [systemMenuItemMap]);

    return (<>
        {menuItemList.map((menuItem) => {
            if (menuItem.id === consts.DOCKER_SERVER_ID) {
                return (<DockerStatusRow key={menuItem.id} vscode={props.vscode} menuItem={menuItem as types.DockerSystemMenuItem} />)
            } else {
                return (<LmStatusRow key={menuItem.id} menuItem={menuItem} serverStatus={serverStatus} />)
            }
        })}
    </>);
};

export default HomePage;
