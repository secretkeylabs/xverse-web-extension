import { useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import CloseIcon from '@assets/img/x.svg';

import { ContentType } from './common';

const MIN_FONT_SIZE = 9;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0px;
  left: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(18, 21, 30, 0.85);
  backdrop-filter: blur(8px);
`;

const PreviewImg = styled.img`
  width: 240px;
  height: 240px;
  max-width: 80vw;
  max-height: 80vh;
`;

const PreviewVideo = styled.video`
  width: 240px;
  height: 240px;
  max-width: 80vw;
  max-height: 80vh;
`;

const PreviewAudio = styled.audio`
  width: 240px;
  height: 240px;
  max-width: 80vw;
  max-height: 80vh;
`;

const PreviewTextContainer = styled.div`
  max-width: 100vw;
  max-height: 100vh;
  overflow-y: auto;
`;

type PreviewTextProps = {
  fontSize: number;
};
const PreviewText = styled.pre<PreviewTextProps>((props) => ({
  fontSize: props.fontSize || 24,
  width: '80vw',
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
}));

const CloseTick = styled.img((props) => ({
  width: props.theme.spacing(12),
  height: props.theme.spacing(12),
  position: 'absolute',
  top: props.theme.spacing(12),
  right: props.theme.spacing(8),
  cursor: 'pointer',
}));

type Props = {
  onClick: () => void;
  type: 'text' | 'file';
  content: string;
  contentType: ContentType;
  contentTypeRaw: string;
  visible: boolean;
};

function Preview({ onClick, type, content, contentType, contentTypeRaw, visible }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLPreElement>(null);
  const [fontSize, setFontSize] = useState<number>(24);

  useLayoutEffect(() => {
    // this decreases the font size until the preview text fits in the container
    if (!visible || !containerRef.current || !textRef.current || fontSize < MIN_FONT_SIZE) return;

    const { height: parentHeight } = containerRef.current.getBoundingClientRect();
    const { height: preHeight } = textRef.current.getBoundingClientRect();

    if (preHeight <= parentHeight * 0.9) return;

    setFontSize(fontSize - 0.5);
  }, [visible, fontSize]);

  if (!visible) return null;

  let preview: React.ReactElement | null = null;

  if (contentType === ContentType.TEXT || contentType === ContentType.JSON) {
    const displayContent = type === 'text' ? content : atob(content);

    preview = (
      <PreviewTextContainer>
        <PreviewText fontSize={fontSize} ref={textRef}>
          {displayContent}
        </PreviewText>
      </PreviewTextContainer>
    );
  } else if (contentType === ContentType.HTML) {
    preview = (
      <PreviewTextContainer>
        <PreviewText fontSize={fontSize} ref={textRef}>
          <pre>{content}</pre>
        </PreviewText>
      </PreviewTextContainer>
    );
  } else if (contentType === ContentType.IMAGE) {
    preview = <PreviewImg src={`data:${contentTypeRaw};base64,${content}`} alt="Inscription" />;
  } else if (contentType === ContentType.VIDEO) {
    preview = (
      <PreviewVideo controls>
        <track kind="captions" />
        <source src={`data:${contentTypeRaw};base64,${content}`} type={contentTypeRaw} />
      </PreviewVideo>
    );
  } else if (contentType === ContentType.AUDIO) {
    preview = (
      <PreviewAudio controls>
        <track kind="captions" />
        <source src={`data:${contentTypeRaw};base64,${content}`} type={contentTypeRaw} />
      </PreviewAudio>
    );
  }

  return (
    <Container onClick={onClick} ref={containerRef}>
      <CloseTick src={CloseIcon} onClick={onClick} />
      {preview}
    </Container>
  );
}

export default Preview;
