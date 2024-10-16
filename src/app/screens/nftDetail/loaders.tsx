import { BetterBarLoader } from '@components/barLoader';
import Separator from '@components/separator';
import styled from 'styled-components';
import { ButtonContainer, GalleryRowContainer } from './index.styled';

const ActionButtonLoader = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: props.theme.space.xs,
}));

const ActionButtonsLoader = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  columnGap: props.theme.spacing(11),
}));

const ExtensionLoaderContainer = styled.div({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center',
});

const GalleryLoaderContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const InfoContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  padding: `0 ${props.theme.space.m}`,
}));

const StyledBarLoader = styled(BetterBarLoader)<{
  withMarginBottom?: boolean;
}>((props) => ({
  padding: 0,
  borderRadius: props.theme.radius(1),
  marginBottom: props.withMarginBottom ? props.theme.space.s : 0,
}));

const StyledSeparator = styled(Separator)`
  width: 100%;
`;

const TitleLoader = styled.div`
  display: flex;
  flex-direction: column;
`;

export function GalleryLoader() {
  return (
    <GalleryRowContainer $withGap>
      <StyledBarLoader width={376.5} height={376.5} />
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
    </GalleryRowContainer>
  );
}

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
