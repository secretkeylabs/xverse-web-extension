import Separator from '@components/separator';
import styled from 'styled-components';
import { ButtonContainer, StyledBarLoader } from './index.styled';

const ActionButtonsLoader = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  columnGap: props.theme.spacing(11),
}));

const ActionButtonLoader = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: props.theme.space.xs,
}));

const ExtensionLoaderContainer = styled.div({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center',
});

const InfoContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  padding: `0 ${props.theme.space.m}`,
}));

const StyledSeparator = styled(Separator)`
  width: 100%;
`;

const TitleLoader = styled.div`
  display: flex;
  flex-direction: column;
`;

const GalleryLoaderContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

export function ExtensionLoader() {
  return (
    <ExtensionLoaderContainer>
      <TitleLoader>
        <StyledBarLoader width={100} height={18.5} withMarginBottom />
        <StyledBarLoader width={100} height={30} />
      </TitleLoader>
      <StyledBarLoader width={100} height={18.5} />
      <StyledBarLoader width={136} height={136} />
      <ActionButtonsLoader>
        <ActionButtonLoader>
          <StyledBarLoader width={48} height={48} />
          <StyledBarLoader width={30} height={15.5} />
        </ActionButtonLoader>
        <ActionButtonLoader>
          <StyledBarLoader width={48} height={48} />
          <StyledBarLoader width={30} height={15.5} />
        </ActionButtonLoader>
      </ActionButtonsLoader>
      <StyledSeparator />
      <InfoContainer>
        <div>
          <StyledBarLoader width={100} height={18.5} />
          <StyledBarLoader width={80} height={18.5} />
        </div>
        <div>
          <StyledBarLoader width={100} height={18.5} />
          <StyledBarLoader width={80} height={18.5} />
        </div>
      </InfoContainer>
    </ExtensionLoaderContainer>
  );
}

export function GalleryLoader() {
  return (
    <GalleryLoaderContainer>
      <StyledBarLoader width={120} height={21} withMarginBottom />
      <StyledBarLoader width={180} height={40} withMarginBottom />
      <StyledBarLoader width={100} height={18.5} withMarginBottom />
      <ButtonContainer>
        <StyledBarLoader width={190} height={44} />
        <StyledBarLoader width={190} height={44} />
      </ButtonContainer>
      <StyledBarLoader width={100} height={31} withMarginBottom />
      <StyledBarLoader width={400} height={18.5} withMarginBottom />
      <StyledBarLoader width={400} height={18.5} withMarginBottom />
      <StyledBarLoader width={400} height={18.5} withMarginBottom />
      <StyledBarLoader width={400} height={18.5} withMarginBottom />
      <StyledBarLoader width={400} height={18.5} withMarginBottom />
      <StyledBarLoader width={400} height={18.5} withMarginBottom />
      <StyledBarLoader width={392} height={44} />
    </GalleryLoaderContainer>
  );
}
