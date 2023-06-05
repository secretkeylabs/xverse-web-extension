import { Inscription } from '@secretkeylabs/xverse-core/types';
import { getTextOrdinalContent } from '@secretkeylabs/xverse-core/api/index';
import { useEffect, useState } from 'react';

const useTextOrdinalContent = (ordinal: Inscription) => {
  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    if (ordinal) {
      (async () => {
        if (ordinal?.content_type.startsWith('text/plain')) {
          const response: string = await getTextOrdinalContent(ordinal?.id);
          setTextContent(response ?? '');
        }
      })();
    }
  }, [ordinal]);

  return textContent.toString();
};

export default useTextOrdinalContent;
