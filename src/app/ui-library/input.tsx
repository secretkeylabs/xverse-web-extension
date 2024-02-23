import { ChangeEvent, useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';
import { InputFeedback, type FeedbackVariant } from './inputFeedback';

type InputVariant = 'danger' | 'default';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${(props) => props.theme.space.xs};
`;

const Title = styled.div`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_200};
`;

const InfoText = styled.div`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_0};
`;

const InputContainer = styled.div`
  position: relative;
`;

const InputField = styled.input`
  ${(props) => props.theme.typography.body_medium_m}

  width: 100%;

  color: ${(props) => props.theme.colors.white_200};
  background-color: ${(props) => props.theme.colors.elevation_n1};
  padding: ${(props) => props.theme.spacing(5)}px ${(props) => props.theme.space.m};
  border-radius: 8px;

  caret-color: ${(props) => props.theme.colors.tangerine};

  border: 1px solid ${(props) => props.theme.colors.white_800};
  &:focus:enabled {
    border: 1px solid ${(props) => props.theme.colors.white_600};
  }

  &:disabled {
    border: 1px solid ${(props) => props.theme.colors.white_900};
    cursor: not-allowed;
  }

  &.danger:enabled {
    border: 1px solid ${(props) => props.theme.colors.danger_dark_200};
    :focus {
      border: 1px solid ${(props) => props.theme.colors.danger_dark_200};
    }
  }

  ::placeholder {
    color: ${(props) => props.theme.colors.white_400};
  }
`;

const ComplicationsContainer = styled.div`
  position: absolute;
  right: ${(props) => props.theme.spacing(8)}px;
  top: 0;

  height: 100%;

  display: flex;
  flex-direction: row;
  align-items: center;

  > *:first-child {
    margin-left: ${(props) => props.theme.spacing(4)}px;
  }
`;

const ClearButton = styled.div<{ $hasSiblings?: boolean }>`
  cursor: pointer;

  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  width: 16px;
  height: 16px;
  background-color: ${(props) => props.theme.colors.white_200};
  color: ${(props) => props.theme.colors.elevation_n1};
  border-radius: 50%;
  margin-right: ${(props) => (props.$hasSiblings ? props.theme.spacing(4) : 0)}px;

  :before,
  :after {
    position: absolute;
    left: 7px;
    content: ' ';
    height: 8px;
    width: 2px;
    background-color: black;
  }
  :before {
    transform: rotate(45deg);
  }
  :after {
    transform: rotate(-45deg);
  }
`;

const SubText = styled.div`
  color: ${(props) => props.theme.colors.white_400};
  margin-top: ${(props) => props.theme.spacing(4)}px;

  ${(props) => props.theme.typography.body_s}
`;

const Feedback = styled.div`
  margin-top: 8px;
`;

type Props = {
  title?: string;
  placeholder?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'number';
  hideClear?: boolean;
  infoPanel?: React.ReactNode;
  complications?: React.ReactNode;
  variant?: InputVariant;
  subText?: string;
  className?: string;
  disabled?: boolean;
  feedback?: {
    message: string;
    variant?: FeedbackVariant;
  }[];
};

function Input({
  title,
  placeholder,
  value,
  onChange,
  onBlur,
  type = 'text',
  hideClear = false,
  infoPanel,
  complications,
  variant = 'default',
  subText,
  className,
  feedback,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const complicationsRef = useRef<HTMLDivElement>(null);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange(e);
  };

  useLayoutEffect(() => {
    // This ensures that the complications don't overlap the text input
    const stickyComplicationsRef = complicationsRef.current;
    const stickyInputRef = inputRef.current;

    if (stickyComplicationsRef && stickyInputRef) {
      const padInput = () => {
        const complicationsWidth = stickyComplicationsRef.clientWidth;
        stickyInputRef.style.paddingRight = `${complicationsWidth + 16}px`;
      };

      padInput();

      const resizeObserver = new ResizeObserver(padInput);
      resizeObserver.observe(stickyComplicationsRef);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  const handleClear = () => {
    onChange({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
  };

  const displayVariant = feedback?.some((f) => f.variant === 'danger') ? 'danger' : variant;

  return (
    <Container className={className}>
      {(title || infoPanel) && (
        <TitleContainer>
          <Title>{title}</Title>
          {infoPanel && <InfoText>{infoPanel}</InfoText>}
        </TitleContainer>
      )}
      <InputContainer>
        <InputField
          className={displayVariant}
          ref={inputRef}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
        />
        <ComplicationsContainer ref={complicationsRef}>
          {!hideClear && value && (
            <ClearButton onClick={handleClear} $hasSiblings={!!complications} />
          )}
          {complications}
        </ComplicationsContainer>
      </InputContainer>
      {subText && <SubText>{subText}</SubText>}
      <Feedback>
        {feedback?.map((f) => (
          <InputFeedback key={f.message} message={f.message} variant={f.variant} />
        ))}
      </Feedback>
    </Container>
  );
}

export default Input;
