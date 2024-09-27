import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import { ArrowDown } from '@phosphor-icons/react';
import { StyledP } from '@ui-library/common.styled';
import { getShortTruncatedAddress } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import { Pill, StyledPillLabel } from '../runesSection/styles';
import ContentLabel from './ContentLabel';
import {
  ButtonIcon,
  CardContainer,
  CardRow,
  IconLabel,
  InfoIconContainer,
  YourAddress,
} from './styles';

type InscribeSectionProps = {
  contentType: string;
  content: string;
  payloadType: 'BASE_64' | 'PLAIN_TEXT';
  ordinalsAddress: string;
  repeat?: number;
  inscriptionId?: string;
};

function InscribeSection({
  repeat,
  content,
  contentType,
  ordinalsAddress,
  payloadType,
  inscriptionId,
}: InscribeSectionProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  return (
    <CardContainer bottomPadding>
      <CardRow>
        <StyledPillLabel>
          {t('INSCRIBE.TITLE')}
          {repeat && <Pill>{`x${repeat}`}</Pill>}
        </StyledPillLabel>
      </CardRow>
      <CardRow center>
        <IconLabel>
          <div>
            <ButtonIcon src={OrdinalsIcon} />
          </div>
          <div>{t('INSCRIBE.ORDINAL')}</div>
        </IconLabel>
        <ContentLabel
          contentType={contentType}
          content={content}
          type={payloadType}
          repeat={repeat}
          inscriptionId={inscriptionId}
        />
      </CardRow>
      <CardRow center>
        <IconLabel>
          <InfoIconContainer>
            <ArrowDown size={16} weight="bold" />
          </InfoIconContainer>
          {t('INSCRIBE.TO')}
        </IconLabel>
        <YourAddress>
          <StyledP typography="body_medium_m" color="white_0">
            {getShortTruncatedAddress(ordinalsAddress)}
          </StyledP>
          <StyledP typography="body_medium_s" color="white_400">
            {t('INSCRIBE.YOUR_ADDRESS')}
          </StyledP>
        </YourAddress>
      </CardRow>
    </CardContainer>
  );
}

export default InscribeSection;
