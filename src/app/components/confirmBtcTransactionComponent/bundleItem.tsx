import OrdinalIcon from '@assets/img/rareSats/ic_ordinal_small.svg';
import RareSatIcon from '@components/rareSatIcon/rareSatIcon';
import { DotsThree, Eye } from '@phosphor-icons/react';
import { BundleSatRange, SatRangeInscription } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { getSatLabel } from '@utils/rareSats';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import Theme from 'theme';

const RangeContainer = styled.div``;

const Range = styled.div`
  display: flex;
  border-radius: 6px;
  border: 1px solid ${(props) => props.theme.colors.white_800};
  padding: 1px;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}`;

const Column = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-end;
`;

const SatsText = styled(StyledP)`
  width: 100%;
  text-align: right;
`;
const InscriptionRow = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: transparent;
  cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
`;
const InscriptionText = styled(StyledP)`
  text-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin-left: 4px;
`;

const BundleText = styled(StyledP)`
  text-align: right;
  width: 100%;
`;

function BundleItem({
  item,
  ordinalEyePressed,
}: {
  item: BundleSatRange;
  ordinalEyePressed?: (inscription: SatRangeInscription) => void;
}) {
  const renderedIcons = () => (
    <RangeContainer>
      <Range>
        {item.satributes.map((satribute, index) => {
          if (index > 4) return null;
          if (index === 4) {
            return <DotsThree color={Theme.colors.white_200} size="20" />;
          }
          return <RareSatIcon key={satribute} type={satribute} size={24} />;
        })}
      </Range>
    </RangeContainer>
  );

  return (
    <Container>
      {renderedIcons()}
      <Column>
        <BundleText typography="body_medium_m">{getSatLabel(item.satributes)}</BundleText>
        <NumericFormat
          value={item.totalSats}
          displayType="text"
          suffix={item.totalSats > 1 ? ' Sats' : ' Sat'}
          thousandSeparator
          renderText={(value: string) => (
            <SatsText typography="body_medium_m" color="white_400">
              {value}
            </SatsText>
          )}
        />
        {item.inscriptions.map((inscription) => (
          <InscriptionRow
            type="button"
            key={inscription.id}
            onClick={() => {
              ordinalEyePressed?.(inscription);
            }}
            disabled={!ordinalEyePressed}
          >
            <img src={OrdinalIcon} alt="ordinal" />
            <InscriptionText typography="body_medium_m" color="white_0">
              {inscription.inscription_number}
            </InscriptionText>
            {ordinalEyePressed && <Eye color={Theme.colors.white_0} size={20} weight="fill" />}
          </InscriptionRow>
        ))}
      </Column>
    </Container>
  );
}

export default BundleItem;
