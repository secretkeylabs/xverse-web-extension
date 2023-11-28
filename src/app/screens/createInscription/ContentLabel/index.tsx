import axios from 'axios';
import { MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { DotsThreeVertical, Eye, Share } from '@phosphor-icons/react';
import { XVERSE_ORDIVIEW_URL } from '@utils/constants';

import useWalletSelector from '@hooks/useWalletSelector';
import { getBrc20Details } from '@utils/brc20';
import { ContentType } from './common';
import Preview from './preview';
import getSatsDetails from './utils';

const previewableContentTypes = new Set([
  ContentType.IMAGE,
  ContentType.TEXT,
  ContentType.HTML,
  ContentType.JSON,
  ContentType.VIDEO,
  ContentType.AUDIO,
  ContentType.MARKDOWN,
]);

const ordiViewTypes = new Set([ContentType.HTML, ContentType.SVG, ContentType.MARKDOWN]);

const getContentType = (inputContentType: string) => {
  const contentType = inputContentType.toLowerCase();
  if (contentType.includes('svg')) return ContentType.SVG;
  if (contentType.includes('image')) return ContentType.IMAGE;
  if (contentType.includes('html')) return ContentType.HTML;
  if (contentType.includes('markdown')) return ContentType.MARKDOWN;
  if (contentType.includes('text')) return ContentType.TEXT;
  if (contentType.includes('json')) return ContentType.JSON;
  if (contentType.includes('video')) return ContentType.VIDEO;
  if (contentType.includes('audio')) return ContentType.AUDIO;

  return ContentType.OTHER;
};

const isPreviewable = (contentType: ContentType) => previewableContentTypes.has(contentType);
const isOrdiPreviewable = (contentType: ContentType) => ordiViewTypes.has(contentType);

const SuffixContainer = styled.div(props => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
}));

const Container = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  cursor: 'pointer',
});

const ButtonIcon = styled.div((props) => ({
  width: 20,
  height: 20,
  marginLeft: props.theme.spacing(4),
  position: 'relative',
}));

const Suffix = styled.div((props) => ({
  ...props.theme.typography.body_medium_s,
  color: props.theme.colors.white_400,
}));

const MenuContainer = styled.div({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
});

const Menu = styled.div((props) => ({
  position: 'absolute',
  top: 0,
  right: 0,

  display: 'inline-flex',
  padding: props.theme.spacing(6),
  flexDirection: 'column',
  alignItems: 'flex-start',

  borderRadius: 12,
  background: props.theme.colors.background.elevation3,
  boxShadow: '0px 4px 16px 0px rgba(0, 0, 0, 0.25)',
}));

const MenuItem = styled.div((props) => ({
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  width: '100%',
  padding: props.theme.spacing(6),
}));

type Props = {
  type: 'BASE_64' | 'PLAIN_TEXT';
  contentType: string;
  content: string;
};

function ContentIcon({ type, content, contentType: inputContentType }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'INSCRIPTION_REQUEST.PREVIEW' });
  const [showPreview, setShowPreview] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { network } = useWalletSelector();

  useEffect(() => {
    // Close menu when clicking outside
    if (!showMenu || !menuRef.current) return;

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef, showMenu]);

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

  const showPreviewButton = canShowPreview && !canPreviewInOrd;
  const showOrdButton = !canShowPreview && canPreviewInOrd;
  const showMenuButton = canShowPreview && canPreviewInOrd;

  const onTogglePreview = async (e?: ReactMouseEvent<HTMLDivElement, MouseEvent>) => {
    setShowMenu(false);

    // prevent click from going to menu parent
    if (e) e.stopPropagation();

    if (canShowPreview) setShowPreview((current) => !current);
  };

  const onOrdClick = async (e?: ReactMouseEvent<HTMLDivElement, MouseEvent>) => {
    setShowMenu(false);

    // prevent click from going to menu parent
    if (e) e.stopPropagation();

    const displayContent = type === 'PLAIN_TEXT' ? content : atob(content);

    if (canPreviewInOrd) {
      const { data: previewId } = await axios.post(
        `${XVERSE_ORDIVIEW_URL(network.type)}/previewHtml`,
        {
          html: displayContent,
          contentType: inputContentType,
        },
      );

      window.open(`${XVERSE_ORDIVIEW_URL(network.type)}/previewHtml/${previewId}`, '_blank');
    }
  };

  const onMenuClick = () => {
    setShowMenu((current) => !current);
  };

  const clickAction = () => {
    if (showPreviewButton) onTogglePreview();
    if (showOrdButton) onOrdClick();
    if (showMenuButton) onMenuClick();
  };

  return (
    <>
      <Container onClick={clickAction}>
        <div>{inputContentType}</div>
        {showPreviewButton && (
          <ButtonIcon>
            <Eye size={20} />
          </ButtonIcon>
        )}
        {showOrdButton && (
          <ButtonIcon>
            <Share size={20} />
          </ButtonIcon>
        )}
        {showMenuButton && (
          <MenuContainer>
            <ButtonIcon>
              <DotsThreeVertical size={20} />
            </ButtonIcon>
            {showMenu && (
              <Menu ref={menuRef}>
                <MenuItem onClick={onTogglePreview}>{t('SHOW')}</MenuItem>
                <MenuItem onClick={onOrdClick}>{t('PREVIEW')}</MenuItem>
              </Menu>
            )}
          </MenuContainer>
        )}
      </Container>

      <Preview
        content={content}
        contentType={contentType}
        contentTypeRaw={inputContentType}
        type={type}
        visible={showPreview}
        onClick={() => setShowPreview(false)}
      />
    </>
  );
}

export default ContentIcon;
