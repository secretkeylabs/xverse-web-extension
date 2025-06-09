import ExoticSatsRow from '@components/exoticSatsRow/exoticSatsRow';
import RareSatIcon from '@components/rareSatIcon/rareSatIcon';
import type { BundleSatRange } from '@secretkeylabs/xverse-core';
import { POPUP_WIDTH } from '@utils/constants';
import { getSatLabel } from '@utils/rareSats';
import styled from 'styled-components';

const RangeContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
`;

const Range = styled.div`
  display: flex;
  border-radius: 6px;
  border: 1px solid var(--white-800, rgba(255, 255, 255, 0.2));
  padding: 1px;
  flex-wrap: wrap;
`;

const Container = styled.div<{ isGalleryOpen?: boolean }>((props) => ({
  marginBottom: props.theme.space.s,
  padding: props.isGalleryOpen ? `0 ${props.theme.space.m}` : 0,
}));

export default function RareSatsBundleGridItem({ item }: { item: BundleSatRange }) {
  const isGalleryOpen: boolean = document.documentElement.clientWidth > POPUP_WIDTH;
  return (
    <Container isGalleryOpen={isGalleryOpen}>
      <ExoticSatsRow
        title={getSatLabel(item.satributes)}
        satAmount={Number(item.totalSats)}
        inscriptions={item.inscriptions}
        icons={
          <RangeContainer>
            <Range>
              {item.satributes.map((satribute) => (
                <RareSatIcon key={satribute} type={satribute} size={24} />
              ))}
            </Range>
          </RangeContainer>
        }
      />
    </Container>
  );
}
