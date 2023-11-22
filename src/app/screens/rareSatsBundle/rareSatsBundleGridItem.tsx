import ExoticSatsRow from '@components/exoticSatsRow/exoticSatsRow';
import RareSatIcon from '@components/rareSatIcon/rareSatIcon';
import {
  BundleSatRange,
  getRareSatsLabelByType,
  RareSatsType,
  RoadArmorRareSats,
  RoadArmorRareSatsType,
} from '@utils/rareSats';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('translation');

  const getSatLabel = (satributes: RareSatsType[]) => {
    const isLengthGrateThanTwo = satributes.length > 2;
    if (satributes.length === 1) {
      return getRareSatsLabelByType(satributes[0]);
    }

    // we expect to roadarmor sats be in the first position
    if (RoadArmorRareSats.includes(satributes[0] as RoadArmorRareSatsType)) {
      return `${getRareSatsLabelByType(satributes[0])} ${t(
        isLengthGrateThanTwo ? 'COMMON.COMBO' : `RARE_SATS.RARITY_LABEL.${satributes[1]}`,
      )}`;
    }

    return isLengthGrateThanTwo
      ? t('COMMON.COMBO')
      : `${getRareSatsLabelByType(satributes[0])} ${getRareSatsLabelByType(satributes[1])}`;
  };

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
