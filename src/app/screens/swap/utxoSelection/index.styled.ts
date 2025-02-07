import { StyledP } from '@ui-library/common.styled';
import styled from 'styled-components';

export const Heading = styled(StyledP)`
  margin-bottom: ${(props) => props.theme.space.xxs};
  font-style: normal;
  font-weight: 700;
  line-height: 140%;
`;

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: ${(props) => props.theme.space.xs};
  padding-right: ${(props) => props.theme.space.xs};
  ${(props) => props.theme.scrollbar}
`;

export const RefreshView = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  margin-top: ${(props) => props.theme.space.m};
`;

export const ButtonImage = styled.button`
  background-color: transparent;

  svg {
    color: ${(props) => props.theme.colors.white_400};
    transition: color 0.1s ease;
  }

  &:hover svg {
    color: ${(props) => props.theme.colors.white_0};
  }
`;

export const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.s};
  margin-top: ${(props) => props.theme.space.m};
  padding-bottom: ${(props) => props.theme.space.s};
`;

export const StickyButtonContainer = styled.div`
  position: sticky;
  bottom: 0;
  padding-bottom: ${(props) => props.theme.space.l};
  padding-top: ${(props) => props.theme.space.s};
  background-color: ${(props) => props.theme.colors.elevation0};
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: ${(props) => props.theme.space.s};
`;

export const TextsColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  flex: 1;
`;

export const Arrow = styled.div`
  flex-direction: column;
  justify-content: center;
  align-self: center;
  align-items: 'flex-start';
  padding: 0 ${(props) => props.theme.space.m};
`;

export const BtnView = styled.div`
  margin-top: ${(props) => props.theme.space.m};
`;

export const LoaderContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-top: ${(props) => props.theme.space.l};
`;
