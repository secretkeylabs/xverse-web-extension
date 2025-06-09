import useAddressBookEntries from '@hooks/useAddressBookEntries';
import useGetAllAccounts from '@hooks/useGetAllAccounts';
import useWalletSelector from '@hooks/useWalletSelector';
import type { FungibleToken } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Callout from '@ui-library/callout';
import { StyledP } from '@ui-library/common.styled';
import { FullWidthDivider } from '@ui-library/divider';
import { type InputFeedbackProps } from '@ui-library/inputFeedback';
import TextArea from '@ui-library/textarea';
import { HIDDEN_BALANCE_LABEL } from '@utils/constants';
import { getRecipientName, getTruncatedAddress } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const BalanceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.space.xxxs};
`;

const Buttons = styled.div`
  margin: ${(props) => props.theme.space.l} 0;
`;

const StyledCallout = styled(Callout)`
  margin-top: ${(props) => props.theme.space.s};
`;

const RecipientAccountName = styled.span`
  color: ${(props) => props.theme.colors.white_0};
`;

type Props = {
  token: FungibleToken;
  amountToSend: string;
  onAmountChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  amountError: InputFeedbackProps | null;
  onNext: () => void;
  processing: boolean;
  isNextEnabled: boolean;
  recipientAddress: string;
};

function AmountSelector({
  token,
  amountToSend,
  onAmountChange,
  amountError,
  onNext,
  processing,
  isNextEnabled,
  recipientAddress,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND_BRC20' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'COMMON' });

  const { balanceHidden } = useWalletSelector();
  const allAccounts = useGetAllAccounts();
  const { entries: addressBook } = useAddressBookEntries();

  const recipientName = getRecipientName(recipientAddress, allAccounts, addressBook, tCommon);

  return (
    <Container>
      <div>
        <StyledP typography="body_medium_m" color="white_400">
          {tCommon('TO')}: <RecipientAccountName>{recipientName}</RecipientAccountName>{' '}
          {getTruncatedAddress(recipientAddress, 6)}
        </StyledP>
        <FullWidthDivider $verticalMargin="m" />
        <TextArea
          titleElement={
            <BalanceContainer data-testid="balance-label">
              <StyledP typography="body_medium_m" color="white_200">
                {token.ticker} {t('BALANCE')}:{' '}
                {balanceHidden ? HIDDEN_BALANCE_LABEL : token.balance.toString()}
              </StyledP>
              {/* @TODO: Add max button */}
              {/* <MaxButton disabled={sendMax} onClick={handleMaxClick}>
              {t('MAX')}
            </MaxButton> */}
            </BalanceContainer>
          }
          value={amountToSend}
          dataTestID="amount-input"
          onChange={onAmountChange}
          placeholder="0"
          rows={1}
          // @TODO: Add convert to fiat button
          // complications={
          //   <ConvertButton
          //     variant="secondary"
          //     title=""
          //     icon={<ArrowsDownUp size={20} />}
          //     onClick={handleUseTokenValueChange}
          //   />
          // }
          hideClear
          autoFocus
        />
        <StyledCallout bodyText={t('MAKE_SURE_THE_RECIPIENT')} />
      </div>
      {/* @TODO: Add fee rate selector */}
      <Buttons>
        <Button
          title={
            amountError?.variant === 'danger' && amountToSend
              ? t('ERRORS.INSUFFICIENT_BALANCE')
              : t('NEXT')
          }
          disabled={!isNextEnabled}
          loading={processing}
          onClick={onNext}
          variant={amountError?.variant === 'danger' && amountToSend ? 'danger' : undefined}
        />
      </Buttons>
    </Container>
  );
}

export default AmountSelector;
