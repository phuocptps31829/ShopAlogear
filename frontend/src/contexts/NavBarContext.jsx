import { createContext, useState, useEffect } from "react";
export const NavbarContext = createContext();

export const NavbarProvider = ({ children }) => {
  const [isPopupOpen, setIsPopupOpen] = useState({
    status: false,
    type: null,
    link: null
  });
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  const [isVisibilityMenu, setIsVisibilityMenu] = useState(false);

  const handleOpenPopup = ({ type, link }) => {
    if(type == 2) {
      window.open(link, "_blank");
    } else {
      setIsPopupOpen(
        {
          status: true,
          type: type,
          link: link
        }
      );
    }
  }

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const toggleNavbar = () => {
    setIsNavbarVisible((prev) => !prev);
  };

  const toggleVisibilityMenu = () => {
    setIsVisibilityMenu((prev) => !prev);
  }

  useEffect(() => {
    if (isNavbarVisible) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isNavbarVisible]);

  return (
    <NavbarContext.Provider
      value={{ isNavbarVisible, setIsNavbarVisible, toggleNavbar, toggleVisibilityMenu, isVisibilityMenu, isPopupOpen, handleOpenPopup, closePopup }}
    >
      {children}
    </NavbarContext.Provider>
  );
};
