import styled from 'styled-components';
import { animated, config, useSpring } from '@react-spring/web';
import DropDownIcon from '@assets/img/transactions/dropDownIcon.svg';
import { useEffect, useState } from 'react';

interface Props {
  title: string;
  text: string;
  children: React.ReactNode;
  initialValue?: boolean;
}

const ContentContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: '12px 16px',
  justifyContent: 'center',
  marginBottom: 12,
  flex: 1,
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
});

const RequestMessageTitle = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(2),
  opacity: 0.7,
  flex: 1,
}));

const Button = styled.button((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'transparent',
  marginLeft: props.theme.spacing(4),
}));

const ExpandedContainer = styled(animated.div)({
  display: 'flex',
  flexDirection: 'column',
  marginTop: 4,
});

const Text = styled.p((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  width: 260,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(4),
}));

export default function CollapsableContainer(props: Props) {
  const { title, children, text, initialValue } = props;
  const [isExpanded, setIsExpanded] = useState(initialValue);
  const [showArrow, setShowArrow] = useState(true);

  useEffect(() => {
    if (text.length < 32) {
      setShowArrow(false);
    }
    if (text === '') setShowArrow(true);
  });

  const slideInStyles = useSpring({
    config: { ...config.gentle, duration: 400 },
    from: { opacity: 0, height: 0 },
    to: {
      opacity: isExpanded ? 1 : 0,
      height: isExpanded ? 'auto' : 0,
    },
  });

  const arrowRotation = useSpring({
    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
    config: { ...config.stiff },
  });

  const onArrowClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <ContentContainer>
      <RowContainer>
        <RequestMessageTitle>{title}</RequestMessageTitle>
        {showArrow && (
          <Button onClick={onArrowClick}>
            <animated.img style={arrowRotation} src={DropDownIcon} alt="Drop Down" />
          </Button>
        )}
      </RowContainer>
      {!isExpanded && text !== '' && <Text>{text}</Text>}
      <ExpandedContainer style={slideInStyles}>{children}</ExpandedContainer>
    </ContentContainer>
  );
}
