import CopyButton from '@components/copyButton';
import styled from 'styled-components';
import * as TDStyles from '../../../../../styles';

const ValueContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.space.xs,
  alignItems: 'center',
}));

type CopyableTextProps = {
  text: string;

  /**
   * Optional text to display instead of the `text` prop.
   */
  displayText?: string;
};

export function CopyableText({ text, displayText }: CopyableTextProps) {
  return (
    <ValueContainer>
      <div>{displayText ?? text}</div>
      <TDStyles.VerticalCenteringNoHeight>
        <CopyButton text={text} removeMargin />
      </TDStyles.VerticalCenteringNoHeight>
    </ValueContainer>
  );
}
