import React from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { RootState } from "./store/store";

const Layout = () => {
    const pageType = useSelector((state: RootState) => state.pageInfo.pageType);
    const [lastPageType, setLastPageType] = React.useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        if (pageType === lastPageType) {
            return;
        }

        if (pageType) {
            setLastPageType(pageType);
            navigate(`/${pageType}${location.search}`);
        } else {
            setLastPageType(null);
        }
    }, [pageType, navigate, location, lastPageType]);

    return (
        <Outlet />
    );
};

export default Layout;
