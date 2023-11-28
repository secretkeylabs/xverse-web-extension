import ExoticSatsRow from '@components/exoticSatsRow/exoticSatsRow';
import RareSatIcon from '@components/rareSatIcon/rareSatIcon';
import { BundleSatRange } from '@secretkeylabs/xverse-core';
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

const Container = styled.div((props) => ({
  marginBottom: props.theme.space.s,
  padding: `0 ${props.theme.space.m}`,
}));

export function RareSatsBundleGridItem({ item }: { item: BundleSatRange }) {
  return (
    <Container>
      <ExoticSatsRow
        title={getSatLabel(item.satributes)}
        satAmount={item.totalSats}
        inscriptions={item.inscriptions}
        icons={
          <RangeContainer>
            <Range>
              {item.satributes.map((satribute) => (
                <RareSatIcon key={satribute} type={satribute} />
              ))}
            </Range>
          </RangeContainer>
        }
      />
    </Container>
  );
}
export default RareSatsBundleGridItem;
