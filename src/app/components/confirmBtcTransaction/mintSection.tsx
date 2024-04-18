import { ArrowRight } from '@phosphor-icons/react';
import { RuneSummary } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from '../../../theme';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  paddingTop: props.theme.space.m,
  justifyContent: 'center',
  marginBottom: props.theme.space.s,
}));

const RowCenter = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const AddressLabel = styled(StyledP)((props) => ({
  marginLeft: props.theme.space.xxs,
}));

const Header = styled(RowCenter)((props) => ({
  marginBottom: props.theme.space.m,
  padding: `0 ${props.theme.space.m}`,
}));

type Props = {
  mints?: RuneSummary['mint'][];
};

function MintSection({ mints }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  if (!mints) return null;

  return (
    <>
      {mints.map(
        (mint) =>
          mint && (
            <Container key={mint?.runeName}>
              <Header>
                <StyledP typography="body_medium_m" color="white_200">
                  {t('YOU_WILL_MINT')}
                </StyledP>
                <RowCenter>
                  <ArrowRight weight="bold" color={Theme.colors.white_0} size={16} />
                  <AddressLabel typography="body_medium_m">
                    {t('YOUR_ORDINAL_ADDRESS')}
                  </AddressLabel>
                </RowCenter>
              </Header>
              <Header>
                <StyledP typography="body_medium_m" color="white_200">
                  {t('NAME')}
                </StyledP>
                <StyledP typography="body_medium_m" color="white_0">
                  {mint?.runeName}
                </StyledP>
              </Header>
              <Header>
                <StyledP typography="body_medium_m" color="white_200">
                  {t('SYMBOL')}
                </StyledP>
                <StyledP typography="body_medium_m" color="white_0">
                  {mint?.symbol}
                </StyledP>
              </Header>
              <Header>
                <StyledP typography="body_medium_m" color="white_200">
                  {t('AMOUNT')}
                </StyledP>
                <StyledP typography="body_medium_m" color="white_0">
                  {mint?.amount.toString(10)}
                </StyledP>
              </Header>
            </Container>
          ),
      )}
    </>
  );
}

export default MintSection;
