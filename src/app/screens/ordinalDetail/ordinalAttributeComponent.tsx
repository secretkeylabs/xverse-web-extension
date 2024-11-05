import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginTop: props.theme.space.m,
  width: '100%',
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  width: '100%',
});

const TitleText = styled.h1((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  textAlign: 'center',
}));

const ValueText = styled.p<{
  color?: string;
  fullWidth?: boolean;
}>((props) => ({
  ...props.theme.typography.body_medium_m,
  textAlign: 'left',
  color: props.color || props.theme.colors.white_0,
  width: props.fullWidth ? '100%' : 'auto',
  overflowWrap: 'break-word',
  wordWrap: 'break-word',
  wordBreak: 'break-word',
}));

const OrdinalsTag = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: props.theme.space.xxxs,
  background: 'rgba(39, 42, 68, 0.6)',
  borderRadius: 40,
  height: 22,
  padding: '3px 6px',
}));

const ButtonIcon = styled.img({
  width: 12,
  height: 12,
});

const Text = styled.h1((props) => ({
  ...props.theme.typography.body_bold_m,
  textTransform: 'uppercase',
  color: props.theme.colors.white_0,
  fontSize: 10,
  marginLeft: props.theme.space.xxs,
}));

type Props = {
  title: string;
  value?: string;
  isAddress?: boolean;
  showOridnalTag?: boolean;
  valueColor?: string;
  customValue?: React.ReactNode;
  suffix?: string;
};

function OrdinalAttributeComponent({
  title,
  value,
  showOridnalTag,
  isAddress,
  valueColor,
  customValue,
  suffix,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DETAIL_SCREEN' });

  return (
    <Container>
      <TitleText>{title}</TitleText>
      {customValue ?? (
        <RowContainer>
          {isAddress ? (
            <ValueText color={valueColor} fullWidth={!showOridnalTag}>
              {value}
            </ValueText>
          ) : (
            <NumericFormat
              value={value}
              displayType="text"
              thousandSeparator
              renderText={(text) => <ValueText fullWidth={!showOridnalTag}>{text}</ValueText>}
              suffix={suffix}
            />
          )}
          {showOridnalTag && (
            <OrdinalsTag>
              <ButtonIcon src={OrdinalsIcon} />
              <Text>{t('ORDINALS')}</Text>
            </OrdinalsTag>
          )}
        </RowContainer>
      )}
    </Container>
  );
}

export default OrdinalAttributeComponent;
