import RareSatIcon from '@components/rareSatIcon/rareSatIcon';
import type { RareSatsType } from '@secretkeylabs/xverse-core';
import { getRareSatsLabelByType } from '@utils/rareSats';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: 12,
  background: props.theme.colors.elevation1,
  padding: props.theme.spacing(8),
  marginTop: props.theme.spacing(6),
}));

const TextsColumn = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(6),
}));

const RarityText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
  textTransform: 'capitalize',
}));

const RarityDetailText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
}));

interface Props {
  type: RareSatsType;
}

function RarityTile({ type }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'RARE_SATS' });

  return (
    <Container>
      <RareSatIcon size={32} type={type} />
      <TextsColumn>
        <RarityText>{getRareSatsLabelByType(type)}</RarityText>
        <RarityDetailText>{t(`RARITY_DETAIL.${type.toUpperCase()}`)}</RarityDetailText>
      </TextsColumn>
    </Container>
  );
}
export default RarityTile;
