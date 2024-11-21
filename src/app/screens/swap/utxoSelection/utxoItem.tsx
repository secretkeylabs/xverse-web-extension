import {
  formatBalance,
  satsToBtc,
  type FungibleToken,
  type MarketUtxo,
} from '@secretkeylabs/xverse-core';
import Checkbox from '@ui-library/checkbox';
import { StyledP } from '@ui-library/common.styled';
import { getTruncatedAddress } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  flex-direction: row;
  flex: 1;
  padding: ${(props) => props.theme.space.s};
  padding-right: ${(props) => props.theme.space.m};
  border-radius: ${(props) => props.theme.space.xs};
  border: 1px solid;
  border-color: ${(props) => (props.$selected ? props.theme.colors.white_900 : 'transparent')};
  background-color: ${(props) =>
    props.$selected ? props.theme.colors.elevation2 : props.theme.colors.elevation1};
  transition: background-color 0.1s ease, border-color 0.1s ease;
`;

const RuneTitle = styled(StyledP)`
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: left;
  line-height: 2;
`;

const CheckBoxContainer = styled.div((props) => ({
  marginRight: props.theme.space.s,
}));

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`;
const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  flex: 1;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex: 1;
`;

type Props = {
  utxo: MarketUtxo;
  selected: boolean;
  token?: FungibleToken;
  onSelect: (utxo: MarketUtxo) => void;
};

function UtxoItem({ utxo, selected, token, onSelect }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'COMMON' });

  const satsPerRune = new BigNumber(utxo.price).div(utxo.amount);

  return (
    <Container data-testid="utxo-item" $selected={selected}>
      <CheckBoxContainer>
        <Checkbox
          checkboxId="utxo-box"
          checked={selected}
          onChange={() => onSelect(utxo)}
          color="white_400"
        />
      </CheckBoxContainer>
      <Row>
        <LeftColumn>
          <RuneTitle data-testid="utxo-title" typography="body_medium_m" color="white_0">
            {`${formatBalance(utxo.amount)} ${token?.runeSymbol}`}
          </RuneTitle>
          <StyledP typography="body_medium_s" color="white_400">
            {`${getTruncatedAddress(utxo.identifier, 6)}`}
          </StyledP>
        </LeftColumn>
        <RightColumn>
          <StyledP typography="body_medium_m" color="white_0">
            {formatBalance(satsToBtc(new BigNumber(utxo.price)).toString())} BTC
          </StyledP>
          <NumericFormat
            value={satsPerRune.toFixed(2)}
            displayType="text"
            suffix={` ${t('SATS')}/${token?.runeSymbol}`}
            thousandSeparator
            renderText={(value: string) => (
              <StyledP typography="body_medium_s" color="white_400">
                {value}
              </StyledP>
            )}
          />
        </RightColumn>
      </Row>
    </Container>
  );
}

export default UtxoItem;
