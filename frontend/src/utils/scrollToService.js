export const handleScrollToService = (navigate, location) => {
  const scrollToService = () => {
    const serviceSection = document.getElementById("service-section");
    if (serviceSection) {
      serviceSection.scrollIntoView({ behavior: "smooth" });

      const checkIfScrolled = () => {
        const rect = serviceSection.getBoundingClientRect();
        if (Math.abs(rect.top) < 5) {
          window.scrollBy({ top: -100, behavior: "smooth" });
        } else {
          requestAnimationFrame(checkIfScrolled);
        }
      };

      requestAnimationFrame(checkIfScrolled);
    }
  };

  if (location.pathname !== "/") {
    navigate("/", { replace: true });

    setTimeout(scrollToService, 300);
  } else {
    scrollToService();
  }
};
