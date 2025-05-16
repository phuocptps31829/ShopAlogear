import PropTypes from "prop-types";

export default function PopupYoutube({ link, closePopup }) {
  return (
    <div className="fixed inset-0 bg-[#00000090] flex justify-center items-center z-50" onClick={closePopup}>
      <div className="bg-white p-4 relative w-full max-w-2xl mx-3 md:mx-0 rounded-sm">
        <iframe
          width="100%"
          className="aspect-[16/9]"
          src={link}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}

PopupYoutube.propTypes = {
  link: PropTypes.string.isRequired,
  closePopup: PropTypes.func.isRequired,
};
