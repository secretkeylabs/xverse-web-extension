import { OrdinalInfo } from '@secretkeylabs/xverse-core';
import { getTextOrdinalContent } from '@secretkeylabs/xverse-core/api/index';
import { useEffect, useState } from 'react';

const useTextOrdinalContent = (ordinal: OrdinalInfo) => {
  const [textContent, setTextContent] = useState('');
  const url = `https://gammaordinals.com${ordinal?.metadata.content}`;

  useEffect(() => {
    (async () => {
      if (ordinal?.metadata['content type'].includes('text')) {
        const response = await getTextOrdinalContent(url); setTextContent(response ?? '');
      }
    })();
  }, [ordinal]);

  return textContent.toString();
};

export default useTextOrdinalContent;
