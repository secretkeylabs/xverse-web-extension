import styled from 'styled-components';

export const Separator = styled.hr`
  margin-top: ${(props) => props.theme.space.m};
  border: none;
  border-top: 1px solid ${(props) => props.theme.colors.elevation3};
`;

export default Separator;
