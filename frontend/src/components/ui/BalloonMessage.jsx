import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import icon_zalo from "../../assets/images/icon-zalo.svg";
import icon_phone from "../../assets/images/icon-phone.webp";
import icon_messenger from "../../assets/images/icon_messenger.svg";

export default function BalloonMessage({ CallPhone = false, ZaloChat = true, isBalloonVisible }) {
  return (
    <>
    { CallPhone ? (
      <a
        className={`${isBalloonVisible ? "bottom-[249px]" : "bottom-[132px]" } fixed sm:right-8.5 right-4 z-50 w-auto`}
        href="tel:0961779795"
      >
        <img
          src={icon_phone}
          alt="chatZalo"
          className="h-11 w-11 rounded-full object-cover"
          id="btnZaloChat"
        />
      </a>
    ) : (
      <Link
        className={`${!ZaloChat ? "bottom-[132px]" : "bottom-[190.5px]"} fixed sm:right-8.5 right-4 z-50 w-auto`}
        to={`${ZaloChat ? "https://zalo.me/0961779795" : "https://m.me/alogear.vn"}`}
        target="_blank"
      >
        <img
          src={ZaloChat ? icon_zalo : icon_messenger}
          alt="chatZalo"
          className="h-11 w-11 rounded-full object-cover"
          id="btnZaloChat"
        />
      </Link>
    ) }
    </>
  );
}

BalloonMessage.propTypes = {
  isBalloonVisible: PropTypes.bool,
  CallPhone: PropTypes.bool,
  ZaloChat: PropTypes.bool,
};