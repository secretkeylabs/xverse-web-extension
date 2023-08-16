import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import EyeIcon from '@assets/img/eye.svg';
import ShareIcon from '@assets/img/share.svg';

import { ContentType } from './common';
import Preview from './preview';

const previewableContentTypes = new Set([
  ContentType.IMAGE,
  ContentType.TEXT,
  ContentType.JSON,
  ContentType.VIDEO,
  ContentType.AUDIO,
]);

const ordiViewTypes = new Set([ContentType.HTML]);

const getContentType = (inputContentType: string) => {
  const contentType = inputContentType.toLowerCase();
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

const getIcon = (contentType: ContentType) => {
  if (isPreviewable(contentType)) return EyeIcon;
  if (isOrdiPreviewable(contentType)) return ShareIcon;

  return null;
};

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

type Props = {
  type: 'text' | 'file';
  contentType: string;
  content: string;
};

function ContentIcon({ type, content, contentType: inputContentType }: Props) {
  const { t } = useTranslation('translation');
  const [showPreview, setShowPreview] = useState(false);

  const contentType = getContentType(inputContentType);
  const icon = getIcon(contentType);

  const canShowPreview = isPreviewable(contentType);
  const canPreviewInOrd = isOrdiPreviewable(contentType);

  const onTogglePreview = () => {
    if (canShowPreview) setShowPreview((current) => !current);
    else if (canPreviewInOrd) window.open(`https://TODO.com`, '_blank');
  };

  return (
    <Container>
      <div>{t(`INSCRIPTION_REQUEST.CONTENT_TYPE.${contentType}`)}</div>
      {icon && <ButtonIcon src={icon} onClick={onTogglePreview} />}

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
