export const sendPhotoDiodeTrigger = (
  photoDiodeSetting: 'top-left' | 'top-right' | 'customize' | 'off',
  isEnd: boolean,
): void => {
  const photoDiodeElement = document.getElementById('photo-diode-element');
  if (photoDiodeElement) {
    photoDiodeElement.className = `photo-diode photo-diode-white ${photoDiodeSetting}`;
  }
  setTimeout(() => {
    if (photoDiodeElement) {
      photoDiodeElement.className = `photo-diode photo-diode-black ${photoDiodeSetting}`;
    }
  }, 100);
  if (isEnd) {
    setTimeout(() => {
      if (photoDiodeElement) {
        photoDiodeElement.className = `photo-diode photo-diode-white ${photoDiodeSetting}`;
      }
    }, 200);
    setTimeout(() => {
      if (photoDiodeElement) {
        photoDiodeElement.className = `photo-diode photo-diode-black ${photoDiodeSetting}`;
      }
    }, 300);
  }
};
