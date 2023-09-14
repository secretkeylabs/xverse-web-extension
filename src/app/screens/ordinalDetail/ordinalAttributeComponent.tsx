import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginTop: props.theme.spacing(8),
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['400'],
  textAlign: 'center',
}));

interface ValueTextProps {
  color?: string;
}

const ValueText = styled.h1<ValueTextProps>((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'center',
  color: props.color || props.theme.colors.white[0],
}));

const OrdinalsTag = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 2,
  background: 'rgba(39, 42, 68, 0.6)',
  borderRadius: 40,
  height: 22,
  padding: '3px 6px',
});

const ButtonIcon = styled.img({
  width: 12,
  height: 12,
});

const Text = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  textTransform: 'uppercase',
  color: props.theme.colors.white[0],
  fontSize: 10,
  marginLeft: props.theme.spacing(2),
}));

interface Props {
  title: string;
  value: string;
  isAddress?: boolean;
  showOridnalTag?: boolean;
  valueColor?: string;
}

function OrdinalAttributeComponent({ title, value, showOridnalTag, isAddress, valueColor }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DETAIL_SCREEN' });

  return (
    <Container>
      <TitleText>{title}</TitleText>
      <RowContainer>
        {isAddress ? (
          <ValueText color={valueColor}>{value}</ValueText>
        ) : (
          <NumericFormat
            value={value}
            displayType="text"
            thousandSeparator
            renderText={(text) => <ValueText>{text}</ValueText>}
          />
        )}
        {showOridnalTag && (
          <OrdinalsTag>
            <ButtonIcon src={OrdinalsIcon} />
            <Text>{t('ORDINALS')}</Text>
          </OrdinalsTag>
        )}
      </RowContainer>
    </Container>
  );
}

export default OrdinalAttributeComponent;
