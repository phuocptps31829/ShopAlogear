const URL_IMAGE = import.meta.env.VITE_URL_IMAGE;

export const checkImageUrl = (image) => {
    return image?.startsWith("http") ? image : `${URL_IMAGE}/${image}`;
};