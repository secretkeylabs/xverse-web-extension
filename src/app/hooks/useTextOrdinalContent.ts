import { OrdinalInfo } from '@secretkeylabs/xverse-core';
import { getTextOrdinalContent } from '@secretkeylabs/xverse-core/api/index';
import { useEffect, useState } from 'react';

const useTextOrdinalContent = (ordinal: OrdinalInfo) => {
  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    if (ordinal) {
      (async () => {
        if (ordinal?.metadata['content type'].startsWith('text/plain')) {
          const response: string = await getTextOrdinalContent(ordinal?.metadata.content);
          setTextContent(response ?? '');
        }
      })();
    }
  }, [ordinal]);

  return textContent.toString();
};

export default useTextOrdinalContent;
