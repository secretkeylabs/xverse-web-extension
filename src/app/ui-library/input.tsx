import React, { useLayoutEffect, useRef, type ChangeEvent } from 'react';
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
  align-items: flex-end;
  gap: ${(props) => props.theme.space.l};
  margin-bottom: ${(props) => props.theme.space.xs};
`;

const Title = styled.div`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_200};
`;

const InfoText = styled.div`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_0};
  overflow: hidden;
`;

const InputContainer = styled.div`
  position: relative;
`;

const InputField = styled.input<{ $bgColor?: string; $hasLeftAccessory?: boolean }>`
  ${(props) => props.theme.typography.body_medium_m}

  width: 100%;

  color: ${(props) => props.theme.colors.white_200};
  background-color: ${(props) => props.$bgColor || props.theme.colors.elevation_n1};
  padding: ${(props) => props.theme.spacing(5)}px ${(props) => props.theme.space.m}
    ${(props) => props.theme.spacing(5)}px
    ${(props) => props.theme.spacing(props.$hasLeftAccessory ? 18 : 8)}px;
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

  ::selection {
    background-color: ${(props) => props.theme.colors.tangerine};
    color: ${(props) => props.theme.colors.elevation0};
  }

  ::-webkit-input-placeholder {
    color: ${(props) => props.theme.colors.tangerine};
  }

  ::-moz-placeholder {
    color: ${(props) => props.theme.colors.tangerine};
  }

  :-ms-input-placeholder {
    color: ${(props) => props.theme.colors.tangerine};
  }

  :-moz-placeholder {
    color: ${(props) => props.theme.colors.tangerine};
  }
  ::placeholder {
    color: ${(props) => props.theme.colors.white_400};
  }
`;

const ComplicationsContainer = styled.div`
  position: absolute;
  right: ${(props) => props.theme.space.m};
  top: 0;

  height: 100%;

  display: flex;
  flex-direction: row;
  align-items: center;

  > *:first-child {
    margin-left: ${(props) => props.theme.space.xs};
  }
`;

const ClearButtonContainer = styled.button`
  cursor: pointer;
  background-color: transparent;
  border: none;
  border-radius: 50%;
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
  border-radius: inherit;
  margin-right: ${(props) => (props.$hasSiblings ? props.theme.space.xs : 0)}px;
  transition: opacity 0.1s ease;

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

  :hover {
    opacity: 0.8;
  }

  :active {
    opacity: 0.6;
  }
`;

const LeftAccessoryContainer = styled.div`
  position: absolute;
  left: ${(props) => props.theme.space.xs};
  top: 0;

  height: 100%;

  display: flex;
  flex-direction: row;
  align-items: center;

  > *:first-child {
    margin-left: ${(props) => props.theme.space.xs};
  }
`;

const SubText = styled.div`
  color: ${(props) => props.theme.colors.white_400};
  margin-top: ${(props) => props.theme.space.xs};
  ${(props) => props.theme.typography.body_s}
`;

const Feedback = styled.div`
  margin-top: ${(props) => props.theme.space.xs};
`;

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  id?: string;
  titleElement?: string | React.ReactNode;
  placeholder?: string;
  value?: string;
  dataTestID?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'number' | 'password';
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
  autoFocus?: boolean;
  bgColor?: string;
  leftAccessory?: {
    icon: React.ReactNode;
  };
};

const Input = React.forwardRef(
  (
    {
      id,
      titleElement,
      placeholder,
      dataTestID,
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
      autoFocus = false,
      bgColor,
      leftAccessory,
      ...props
    }: Props,
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
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
      inputRef.current?.focus();
    };

    const displayVariant = feedback?.some((f) => f.variant === 'danger') ? 'danger' : variant;

    return (
      <Container className={className}>
        {(titleElement || infoPanel) && typeof titleElement === 'string' && (
          <TitleContainer>
            <Title>{titleElement}</Title>
            {infoPanel && <InfoText>{infoPanel}</InfoText>}
          </TitleContainer>
        )}
        {titleElement && typeof titleElement !== 'string' && titleElement}
        <InputContainer>
          {leftAccessory && <LeftAccessoryContainer>{leftAccessory.icon}</LeftAccessoryContainer>}
          <InputField
            id={id}
            className={displayVariant}
            ref={(inputEl) => {
              inputRef.current = inputEl;

              if (ref === null) return;

              if (typeof ref === 'function') {
                ref(inputEl);
                return;
              }

              ref.current = inputEl;
            }}
            type={type}
            data-testid={dataTestID}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            $bgColor={bgColor}
            $hasLeftAccessory={!!leftAccessory}
            value={value}
            {...props}
          />
          <ComplicationsContainer ref={complicationsRef}>
            {!hideClear && value && (
              <ClearButtonContainer type="button" onClick={handleClear}>
                <ClearButton $hasSiblings={!!complications} />
              </ClearButtonContainer>
            )}
            {complications}
          </ComplicationsContainer>
        </InputContainer>
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
  },
);

export default Input;

// some complications that can be used with the input
export const ConvertComplication = styled.button`
  ${(props) => props.theme.typography.body_medium_s}
  user-select: none;

  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.space.xs};

  cursor: pointer;
  background-color: transparent;
  color: ${(props) => props.theme.colors.white_200};
  transition: opacity 0.1s ease;

  &:hover:enabled {
    opacity: 0.8;
  }

  &:disabled {
    color: ${(props) => props.theme.colors.white_600};
    cursor: not-allowed;
  }
`;

export const VertRule = styled.div`
  width: 1px;
  height: 16px;
  background-color: ${(props) => props.theme.colors.white_800};
  margin: 0 8px;
`;

export const MaxButton = styled.button`
  ${(props) => props.theme.typography.body_medium_m}
  user-select: none;
  margin-right: ${(props) => props.theme.space.xxs};

  cursor: pointer;
  background-color: transparent;
  color: ${(props) => props.theme.colors.tangerine};
  transition: color 0.1s ease;

  &:hover:enabled {
    color: ${(props) => props.theme.colors.tangerine_400};
  }

  &:disabled {
    color: ${(props) => props.theme.colors.tangerine_400};
    cursor: not-allowed;
  }
`;
