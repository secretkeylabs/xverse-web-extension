import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from '@phosphor-icons/react';
import styled from 'styled-components';
import { RareSatsType } from '@utils/rareSats';
import RareSatIcon from '@components/rareSatIcon/rareSatIcon';
import useWalletSelector from '@hooks/useWalletSelector';
import { MAGISAT_IO_RARITY_SCAN_URL } from '@utils/constants';
import Theme from 'theme';

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
  color: props.theme.colors.white[0],
  textTransform: 'capitalize',
}));

const RarityDetailText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white[200],
}));

const ButtonText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.orange_main,
  marginRight: props.theme.spacing(2),
}));

const ButtonImage = styled.button((props) => ({
  backgroundColor: 'transparent',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(2),
}));

interface Props {
  type: RareSatsType;
}

function RarityTile({ type }: Props) {
  const { ordinalsAddress } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });

  const openScanLink = () =>
    window.open(`${MAGISAT_IO_RARITY_SCAN_URL}${ordinalsAddress}`, '_blank', 'noopener,noreferrer');

  return (
    <Container>
      <RareSatIcon glow={false} size={32} type={type} />
      <TextsColumn>
        <RarityText>{type}</RarityText>
        <RarityDetailText>{t(`RARITY_DETAIL.${type.toUpperCase()}`)}</RarityDetailText>
        {type === 'unknown' && (
          <ButtonImage onClick={openScanLink}>
            <ButtonText>{t('RARITY_DETAIL.SCAN')}</ButtonText>
            <ArrowUpRight size="16" color={Theme.colors.orange_main} />
          </ButtonImage>
        )}
      </TextsColumn>
    </Container>
  );
}
export default RarityTile;
