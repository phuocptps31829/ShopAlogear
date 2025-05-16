import MainHeader from "./MainHeader";
import NavigationBarMobile from "./NavigationBarMoblie";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

export default function Header() {
  const logoMainState = useSelector((state) => state.logo.logoMain);
  const loadingLogoState = useSelector((state) => state.logo.loading);
  return (
    <header className="sticky top-0 z-40 shadow-lg">
      <NavigationBarMobile />
      <MainHeader logoMain={logoMainState} loadingLogo={loadingLogoState} />
    </header>
  );
}

Header.propTypes = {
  logoMain: PropTypes.object,
  loadingLogo: PropTypes.bool,
};