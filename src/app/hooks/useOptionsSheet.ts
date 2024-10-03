import { useState } from 'react';

export default function useOptionsSheet(initialVisibility = false) {
  const [isVisible, setIsVisible] = useState(initialVisibility);

  const handleOpen = () => {
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    setIsVisible,
    open: handleOpen,
    close: handleClose,
  };
}
