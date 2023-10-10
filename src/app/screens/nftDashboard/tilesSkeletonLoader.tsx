import { BetterBarLoader } from '@components/barLoader';
import styled from 'styled-components';

const TilesLoaderContainer = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
});

const TileLoaderContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

export const StyledBarLoader = styled(BetterBarLoader)<{
  withMarginBottom?: boolean;
}>((props) => ({
  padding: 0,
  borderRadius: 6,
  marginBottom: props.withMarginBottom ? props.theme.spacing(6) : 0,
}));

export function TilesSkeletonLoader({
  className,
  tileSize = 151,
}: {
  className?: string;
  tileSize?: number;
}) {
  return (
    <TilesLoaderContainer className={className}>
      <TileLoaderContainer>
        <StyledBarLoader width={tileSize} height={tileSize} withMarginBottom />
        <StyledBarLoader width={107} height={14} />
      </TileLoaderContainer>
      <TileLoaderContainer>
        <StyledBarLoader width={tileSize} height={tileSize} withMarginBottom />
        <StyledBarLoader width={107} height={14} />
      </TileLoaderContainer>
    </TilesLoaderContainer>
  );
}
