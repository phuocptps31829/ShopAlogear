import PropTypes from "prop-types";

export default function LoadingClient({ className }) {
  return (
    <div className={`fixed top-0 left-0 w-full h-full flex justify-center items-center z-50 bg-[#000000f4] ${className}`}>
        <div className="loader-client">
          <div className="bars">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <div className="text">AloGear.vn</div>
        </div>
    </div>
  );
}

LoadingClient.propTypes = {
  className: PropTypes.string,
};