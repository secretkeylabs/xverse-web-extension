import TokenImage from '@components/tokenImage';
import { FungibleToken } from '@secretkeylabs/xverse-core';
import Avatar from '@ui-library/avatar';
import { StyledP } from '@ui-library/common.styled';
import { getFtTicker } from '@utils/tokens';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

type Props = {
  amountSats: number;
  token: FungibleToken;
  amountToSend: string;
};

const Container = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const AvatarContainer = styled.div`
  margin-right: ${(props) => props.theme.space.xs};
`;

const ColumnContainer = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '24px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
});

const NumberTypeContainer = styled.div`
  text-align: right;
  overflow: hidden;
`;

const EllipsisStyledP = styled(StyledP)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default function RuneAmount({ amountSats, token, amountToSend }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  return (
    <Container>
      <AvatarContainer>
        <Avatar
          src={
            <TokenImage
              currency="FT"
              fungibleToken={token}
              showProtocolIcon={false}
              loading={false}
              size={32}
            />
          }
        />
      </AvatarContainer>
      <ColumnContainer>
        <div>
          <StyledP typography="body_medium_m" color="white_200">
            {t('AMOUNT')}
          </StyledP>
          <StyledP typography="body_medium_s" color="white_400">
            {t('BITCOIN_VALUE')}
          </StyledP>
        </div>
        <NumberTypeContainer>
          <NumericFormat
            value={amountToSend}
            displayType="text"
            thousandSeparator
            suffix={` ${getFtTicker(token)}`}
            renderText={(value: string) => (
              <EllipsisStyledP typography="body_medium_m">{value}</EllipsisStyledP>
            )}
          />
          <StyledP typography="body_medium_s" color="white_400">
            {`${amountSats} ${t('SATS')}`}
          </StyledP>
        </NumberTypeContainer>
      </ColumnContainer>
    </Container>
  );
}
