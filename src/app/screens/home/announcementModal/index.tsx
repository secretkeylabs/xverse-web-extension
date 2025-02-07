import { useSessionStorage } from '@hooks/useStorage';
import { markAlertSeen, shouldShowAlert, type AnnouncementKey } from '@utils/alertTracker';
import { useEffect, useRef, useState } from 'react';
import NativeSegWit from './nativeSegWit';

const getAnnouncementToShow = () => {
  if (shouldShowAlert('native_segwit_intro')) {
    return 'native_segwit_intro';
  }
  return undefined;
};

export default function AnnouncementModal() {
  const [hasShown, setHasShown] = useSessionStorage('announceShown', false);
  const stickyShown = useRef(hasShown);
  const [announcementToShow, setAnnouncementToShow] = useState<AnnouncementKey | undefined>();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setHasShown(true);

    if (stickyShown.current) {
      // we've already shown the announcement modal on this load, so don't show it again
      return;
    }

    const announcement = getAnnouncementToShow();
    setAnnouncementToShow(announcement);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to run this once
  }, []);

  const onClose = (announcementKey: AnnouncementKey) => () => {
    setIsVisible(false);
    markAlertSeen(announcementKey);
  };

  switch (announcementToShow) {
    case 'native_segwit_intro':
      return <NativeSegWit isVisible={isVisible} onClose={onClose('native_segwit_intro')} />;
    default:
      return null;
  }
}
