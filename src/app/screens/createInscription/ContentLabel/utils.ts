import { isValidContentType, isValidFields } from '@utils/brc20';

type SatsDefinition = {
  op: 'ns' | 'reg';
  value: string;
};

const getSatsDetails = (content: string, contentType: string): undefined | SatsDefinition => {
  if (!isValidContentType(contentType)) {
    return undefined;
  }

  try {
    const parsedContent = JSON.parse(content);

    if (parsedContent.p !== 'sns' || !['ns', 'reg'].includes(parsedContent.op)) {
      return undefined;
    }

    const parsedFields = Object.keys(parsedContent);
    const parsedValues = Object.values(parsedContent);

    if (parsedValues.some((v) => typeof v !== 'string')) {
      return undefined;
    }

    const namespaceRequiredFields = new Set(['p', 'op', 'ns']);
    const namespaceOptionalFields = new Set(['about', 'avatar']);

    const nameRequiredFields = new Set(['p', 'op', 'name']);
    const nameOptionalFields = new Set(['avatar', 'rev', 'relay']);

    const isValidNs =
      parsedContent.op === 'ns' &&
      isValidFields(parsedFields, namespaceRequiredFields, namespaceOptionalFields);

    const isValidReg =
      parsedContent.op === 'reg' &&
      isValidFields(parsedFields, nameRequiredFields, nameOptionalFields);

    if (!isValidNs && !isValidReg) {
      return undefined;
    }

    return {
      op: parsedContent.op,
      value: parsedContent.ns || parsedContent.name,
    };
  } catch (e) {
    return undefined;
  }
};

export default getSatsDetails;
