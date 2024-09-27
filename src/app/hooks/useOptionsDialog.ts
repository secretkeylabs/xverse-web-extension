import { OPTIONS_DIALOG_WIDTH } from '@utils/constants';
import { useState } from 'react';

export default function useOptionsDialog(dialogWidth = OPTIONS_DIALOG_WIDTH) {
  const [isVisible, setIsVisible] = useState(false);
  const [indents, setIndents] = useState<{ top: string; left: string } | undefined>();

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    const parentBoundingRect = (event.target as HTMLElement).parentElement?.getBoundingClientRect();

    setIsVisible(true);
    setIndents({
      top: `${parentBoundingRect?.top}px`,
      left: `calc(${parentBoundingRect?.right}px - ${dialogWidth}px)`,
    });
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    setIsVisible,
    indents,
    setIndents,
    open: handleOpen,
    close: handleClose,
  };
}
