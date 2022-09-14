import styled from 'styled-components';

const StyledHeader = styled.h1`
    font-size: 1.5em;
    text-align: center;
    color: ${props => props.theme.colors.action.classic};
`;

const Header = () => {
    return (
        <StyledHeader>Xverse Wallet</StyledHeader>
    );
};

export default Header;