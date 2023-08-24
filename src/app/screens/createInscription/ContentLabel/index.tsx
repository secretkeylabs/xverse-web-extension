import axios from 'axios';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import EyeIcon from '@assets/img/eye.svg';
import ShareIcon from '@assets/img/share.svg';
import { XVERSE_ORDIVIEW_URL } from '@utils/constants';

import { ContentType } from './common';
import Preview from './preview';
import { getBrc20Details, getSatsDetails } from './utils';

const previewableContentTypes = new Set([
  ContentType.IMAGE,
  ContentType.TEXT,
  ContentType.HTML,
  ContentType.JSON,
  ContentType.VIDEO,
  ContentType.AUDIO,
]);

const ordiViewTypes = new Set([ContentType.HTML, ContentType.SVG]);

const getContentType = (inputContentType: string) => {
  const contentType = inputContentType.toLowerCase();
  if (contentType.includes('svg')) return ContentType.SVG;
  if (contentType.includes('image')) return ContentType.IMAGE;
  if (contentType.includes('html')) return ContentType.HTML;
  if (contentType.includes('text')) return ContentType.TEXT;
  if (contentType.includes('json')) return ContentType.JSON;
  if (contentType.includes('video')) return ContentType.VIDEO;
  if (contentType.includes('audio')) return ContentType.AUDIO;

  return ContentType.OTHER;
};

const isPreviewable = (contentType: ContentType) => previewableContentTypes.has(contentType);
const isOrdiPreviewable = (contentType: ContentType) => ordiViewTypes.has(contentType);

const SuffixContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ButtonIcon = styled.img((props) => ({
  width: 20,
  height: 20,
  marginLeft: props.theme.spacing(4),
  cursor: 'pointer',
}));

const Suffix = styled.div((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white[400],
}));

type Props = {
  type: 'text' | 'file';
  contentType: string;
  content: string;
};

function ContentIcon({ type, content, contentType: inputContentType }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'INSCRIPTION_REQUEST.SPECIAL' });
  const [showPreview, setShowPreview] = useState(false);

  const satsDetails = useMemo(
    () => getSatsDetails(content, inputContentType),
    [content, inputContentType],
  );

  const brc20Details = useMemo(
    () => getBrc20Details(content, inputContentType),
    [content, inputContentType],
  );

  if (satsDetails) {
    return (
      <SuffixContainer>
        <div>
          {t('SATS.TITLE')} {t(`SATS.${satsDetails.op.toUpperCase()}`)}
        </div>
        <Suffix>{satsDetails.value}</Suffix>
      </SuffixContainer>
    );
  }

  if (brc20Details) {
    return (
      <SuffixContainer>
        <div>
          {t('BRC20.TITLE')} {t(`BRC20.${brc20Details.op.toUpperCase()}`)}
        </div>
        <Suffix>
          {brc20Details.tick} - {brc20Details.value}
        </Suffix>
      </SuffixContainer>
    );
  }

  const contentType = getContentType(inputContentType);

  const canShowPreview = isPreviewable(contentType);
  const canPreviewInOrd = isOrdiPreviewable(contentType);

  const onTogglePreview = async () => {
    if (canShowPreview) setShowPreview((current) => !current);
  };

  const onOrdClick = async () => {
    if (canPreviewInOrd) {
      const { data: previewId } = await axios.post(`${XVERSE_ORDIVIEW_URL}/previewHtml`, {
        html: content,
      });

      window.open(`${XVERSE_ORDIVIEW_URL}/previewHtml/${previewId}`, '_blank');
    }
  };

  // TODO: if 2 icons, show 3 dots
  return (
    <Container>
      <div>{inputContentType}</div>
      {canShowPreview && <ButtonIcon src={EyeIcon} onClick={onTogglePreview} />}
      {canPreviewInOrd && <ButtonIcon src={ShareIcon} onClick={onOrdClick} />}

      <Preview
        content={content}
        contentType={contentType}
        contentTypeRaw={inputContentType}
        type={type}
        visible={showPreview}
        onClick={() => setShowPreview(false)}
      />
    </Container>
  );
}

export default ContentIcon;
