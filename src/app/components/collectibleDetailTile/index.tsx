import { BetterBarLoader } from '@components/barLoader';
import { POPUP_WIDTH } from '@utils/constants';
import { useMemo } from 'react';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

interface DetailSectionProps {
  isGallery: boolean;
}
const DescriptionHeadingText = styled.p<DetailSectionProps>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  marginBottom: props.theme.spacing(2),
  whiteSpace: 'nowrap',
  textAlign: props.isGallery ? 'right' : 'left',
}));

const DescriptionValueText = styled.p<DetailSectionProps>((props) => ({
  ...props.theme.typography.body_medium_m,
  wordWrap: 'break-word',
  color: props.theme.colors.white_0,
  textAlign: !props.isGallery ? 'left' : 'right',
  maxWidth: 375,
}));

interface ContainerProps {
  isColumnAlignment?: boolean;
}

const Container = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  flexDirection: props.isColumnAlignment ? 'column' : 'row',
  width: '100%',
  flex: 1,
  justifyContent: 'space-between',
}));

const ValueContainer = styled.h1<DetailSectionProps>((props) => ({
  marginLeft: props.isGallery ? props.theme.spacing(6) : 0,
  marginBottom: props.isGallery ? props.theme.spacing(6) : props.theme.spacing(8),
}));

const LoaderContainer = styled.div<DetailSectionProps>((props) => ({
  display: 'flex',
  justifyContent: props.isGallery ? 'flex-end' : 'flex-start',
}));

const StyledBarLoader = styled(BetterBarLoader)`
  padding: 0;
  border-radius: 8px;
`;

interface Props {
  title: string;
  value: string;
  allowThousandSeperator?: boolean;
  suffixValue?: string;
  isColumnAlignment?: boolean;
  isLoading?: boolean;
}

function CollectibleDetailTile({
  title,
  value,
  allowThousandSeperator,
  suffixValue,
  isColumnAlignment,
  isLoading = false,
}: Props) {
  const isGalleryOpen: boolean = useMemo(
    () => document.documentElement.clientWidth > POPUP_WIDTH,
    [],
  );

  return (
    <Container isColumnAlignment={!isGalleryOpen || isColumnAlignment}>
      <DescriptionHeadingText isGallery={isGalleryOpen}>{title}</DescriptionHeadingText>
      <ValueContainer isGallery={isGalleryOpen}>
        {isLoading && (
          <LoaderContainer isGallery={isGalleryOpen}>
            <StyledBarLoader width={100} height={18.5} />
          </LoaderContainer>
        )}
        {!isLoading && allowThousandSeperator && (
          <NumericFormat
            value={value}
            displayType="text"
            thousandSeparator
            renderText={(text) => (
              <DescriptionValueText isGallery={isGalleryOpen}>{text}</DescriptionValueText>
            )}
            suffix={suffixValue ? ` ${suffixValue}` : ''}
          />
        )}
        {!isLoading && !allowThousandSeperator && (
          <DescriptionValueText isGallery={isGalleryOpen}>{value}</DescriptionValueText>
        )}
      </ValueContainer>
    </Container>
  );
}

export default CollectibleDetailTile;
