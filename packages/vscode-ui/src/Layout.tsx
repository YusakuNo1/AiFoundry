import React from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { RootState } from "./store/store";

const Layout = () => {
    const pageContext = useSelector((state: RootState) => state.pageInfo.pageContext);
    const [lastPageType, setLastPageType] = React.useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        if (pageContext?.pageType === lastPageType) {
            return;
        }

        if (pageContext?.pageType) {
            setLastPageType(pageContext.pageType);
            navigate(`/${pageContext?.pageType}${location.search}`);
        } else {
            setLastPageType(null);
        }
    }, [pageContext, navigate, location, lastPageType]);

    return (
        <Outlet />
    );
};

export default Layout;
