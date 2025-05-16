import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectContainer = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const queryRefreshToken = searchParams.get("refreshToken");

    useEffect(() => {
        const refreshToken = Cookies.get("refreshToken");

        if (!refreshToken && !queryRefreshToken) {
            navigate("/");
            setTimeout(() => {
                setLoading(false);
            }, 700);
        } else {
            setLoading(false);
        }
    }, [navigate, queryRefreshToken]);

    if (loading) {
        return <div></div>;
    }

    return (
        <>{ children }</>
    );
};

ProtectContainer.propTypes = {
    children: PropTypes.element,
};

export default ProtectContainer;