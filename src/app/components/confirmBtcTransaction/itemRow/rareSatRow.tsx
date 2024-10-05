import RareSatIcon from '@components/rareSatIcon/rareSatIcon';
import { DotsThree } from '@phosphor-icons/react';
import { btcTransaction } from '@secretkeylabs/xverse-core';
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
`;

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

const BundleText = styled(StyledP)`
  text-align: right;
  width: 100%;
`;

function RareSatRow({
  item,
}: {
  item: btcTransaction.IOSatribute | Omit<btcTransaction.IOSatribute, 'offset'>;
}) {
  return (
    <Container>
      <RangeContainer>
        <Range>
          {item.types.map((rareSatType, index) => {
            if (index > 4) return null;
            if (index === 4) return <DotsThree color={Theme.colors.white_200} size="20" />;
            return <RareSatIcon key={rareSatType} type={rareSatType} size={24} />;
          })}
        </Range>
      </RangeContainer>
      <Column>
        <BundleText typography="body_medium_m">{getSatLabel(item.types)}</BundleText>
        {item.amount > 0 && (
          <NumericFormat
            value={item.amount}
            displayType="text"
            suffix={item.amount > 1 ? ' Sats' : ' Sat'}
            thousandSeparator
            renderText={(value: string) => (
              <SatsText typography="body_medium_m" color="white_400">
                {value}
              </SatsText>
            )}
          />
        )}
      </Column>
    </Container>
  );
}

export default RareSatRow;
