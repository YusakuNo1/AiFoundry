import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';

function AppNavigator() {
    const navigate = useNavigate();
    const pageUrl = useSelector((state: RootState) => state.pageInfo.pageUrl);

    React.useEffect(() => {
        if (pageUrl) {
            navigate(pageUrl);
        }
    }, [pageUrl, navigate]);

    return null;
}

export default AppNavigator;
