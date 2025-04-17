import type React from 'react';
import { useLayoutEffect, useRef, type ChangeEvent } from 'react';
import { InputFeedback, type FeedbackVariant } from '../inputFeedback';
import {
  ClearButton,
  ClearButtonContainer,
  ComplicationsContainer,
  Container,
  Feedback,
  InfoText,
  LeftAccessoryContainer,
  SubText,
  TextAreaContainer,
  TextAreaField,
  Title,
  TitleContainer,
  type TextAreaVariant,
} from './index.styled';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  titleElement?: string | React.ReactNode;
  value: string;
  dataTestID?: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  hideClear?: boolean;
  infoPanel?: React.ReactNode;
  complications?: React.ReactNode;
  variant?: TextAreaVariant;
  subText?: string;
  className?: string;
  feedback?: {
    message: string;
    variant?: FeedbackVariant;
  }[];
  bgColor?: string;
  leftAccessory?: {
    icon: React.ReactNode;
  };
};

function TextArea({
  titleElement,
  value,
  dataTestID,
  onChange,
  hideClear = false,
  infoPanel,
  complications,
  variant = 'default',
  subText,
  className,
  feedback,
  bgColor,
  leftAccessory,
  ...props
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const complicationsRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
  };

  useLayoutEffect(() => {
    // This ensures that the complications don't overlap the text input
    const stickyComplicationsRef = complicationsRef.current;
    const stickyTextareaRef = textareaRef.current;

    if (stickyComplicationsRef && stickyTextareaRef) {
      const padInput = () => {
        const complicationsWidth = stickyComplicationsRef.clientWidth;
        stickyTextareaRef.style.paddingRight = `${complicationsWidth + 16}px`;
      };

      padInput();

      const resizeObserver = new ResizeObserver(padInput);
      resizeObserver.observe(stickyComplicationsRef);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  // Auto-resize the textarea based on content
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(48, textarea.scrollHeight)}px`;
    };

    adjustHeight();

    // Add event listener for manual resizing
    textarea.addEventListener('input', adjustHeight);

    return () => {
      textarea.removeEventListener('input', adjustHeight);
    };
  }, [value]);

  const handleClear = () => {
    onChange({ target: { value: '' } } as ChangeEvent<HTMLTextAreaElement>);
    textareaRef.current?.focus();
  };

  const displayVariant = feedback?.some((f) => f.variant === 'danger') ? 'danger' : variant;

  return (
    <Container className={className}>
      {(titleElement || infoPanel) && (
        <TitleContainer>
          {typeof titleElement === 'string' ? <Title>{titleElement}</Title> : titleElement}
          {infoPanel && <InfoText>{infoPanel}</InfoText>}
        </TitleContainer>
      )}
      <TextAreaContainer>
        {leftAccessory && <LeftAccessoryContainer>{leftAccessory.icon}</LeftAccessoryContainer>}
        <TextAreaField
          {...props}
          className={displayVariant}
          ref={textareaRef}
          value={value}
          data-testid={dataTestID}
          onChange={handleChange}
          $bgColor={bgColor}
          $hasLeftAccessory={!!leftAccessory}
          $contentLength={value.length}
        />
        <ComplicationsContainer ref={complicationsRef}>
          {!hideClear && value && (
            <ClearButtonContainer onClick={handleClear}>
              <ClearButton $hasSiblings={!!complications} />
            </ClearButtonContainer>
          )}
          {complications}
        </ComplicationsContainer>
      </TextAreaContainer>
      {subText && <SubText>{subText}</SubText>}
      {!!feedback?.length && (
        <Feedback>
          {feedback?.map((f) => (
            <InputFeedback key={f.message} message={f.message} variant={f.variant} />
          ))}
        </Feedback>
      )}
    </Container>
  );
}

export default TextArea;
