import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const IsAuthenticated = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const userProfile = useSelector((state) => state.auth.userProfile);
    const navigate = useNavigate();

    const accessToken = Cookies.get("accessToken");
    const refreshToken = Cookies.get("refreshToken");
    useEffect(() => {
        if (userProfile || accessToken || refreshToken) {
            navigate("/profile/information");
            setTimeout(() => {
                setLoading(false);
            }, 700);
        } else {
            setLoading(false);
        }
    }, [userProfile, navigate, accessToken, refreshToken]);

    if (loading) {
        return <div></div>;
    }

    return (
        <>
            { children }
        </>
    );
};

IsAuthenticated.propTypes = {
    children: PropTypes.element,
};

export default IsAuthenticated;