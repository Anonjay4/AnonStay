export const getImageSrc = (path = '') => {
  if (typeof path !== 'string') return '';
  return path.startsWith('http') ? path : `${import.meta.env.VITE_BACKEND_URL}/${path}`;
};

export default getImageSrc;
