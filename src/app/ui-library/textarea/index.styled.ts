import styled from 'styled-components';

export type TextAreaVariant = 'danger' | 'default';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  gap: ${(props) => props.theme.space.l};
  margin-bottom: ${(props) => props.theme.space.xs};
`;

export const Title = styled.div`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_200};
`;

export const InfoText = styled.div`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_0};
  overflow: hidden;
`;

export const TextAreaContainer = styled.div`
  position: relative;
`;

export const TextAreaField = styled.textarea<{
  $bgColor?: string;
  $hasLeftAccessory?: boolean;
  $contentLength: number;
}>`
  ${(props) => {
    if (props.$contentLength > 15) {
      return props.theme.typography.headline_xs;
    }
    if (props.$contentLength > 10) {
      return props.theme.typography.headline_m;
    }
    return props.theme.typography.headline_xl;
  }}

  width: 100%;
  min-height: 34px;

  color: ${(props) => props.theme.colors.white_0};
  background-color: ${(props) => props.$bgColor || 'transparent'};
  border: none;
  border-radius: 0;
  resize: none;

  caret-color: ${(props) => props.theme.colors.tangerine};

  &:focus:enabled {
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
  }

  &.danger:enabled {
    :focus {
      border: 1px solid ${(props) => props.theme.colors.danger_dark_200};
    }
  }

  ::selection {
    background-color: ${(props) => props.theme.colors.tangerine};
    color: ${(props) => props.theme.colors.elevation0};
  }

  ::-webkit-input-placeholder {
    color: ${(props) => props.theme.colors.white_600};
  }

  ::-moz-placeholder {
    color: ${(props) => props.theme.colors.white_600};
  }

  :-ms-input-placeholder {
    color: ${(props) => props.theme.colors.white_600};
  }

  :-moz-placeholder {
    color: ${(props) => props.theme.colors.white_600};
  }
  ::placeholder {
    color: ${(props) => props.theme.colors.white_600};
  }
`;

export const ComplicationsContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  height: 100%;

  display: flex;
  flex-direction: row;
  align-items: center;

  > *:first-child {
    margin-left: ${(props) => props.theme.space.xs};
  }
`;

export const ClearButtonContainer = styled.button`
  cursor: pointer;
  background-color: transparent;
  border: none;
  border-radius: 50%;
`;

export const ClearButton = styled.div<{ $hasSiblings?: boolean }>`
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

export const LeftAccessoryContainer = styled.div`
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

export const SubText = styled.div`
  color: ${(props) => props.theme.colors.white_400};
  margin-top: ${(props) => props.theme.space.xs};
  ${(props) => props.theme.typography.body_s}
`;

export const Feedback = styled.div`
  margin-top: ${(props) => props.theme.space.xs};
`;
