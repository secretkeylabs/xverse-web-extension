import styled from 'styled-components';

interface CheckBoxProps {
  isChecked: boolean;
  checkBoxId: string;
  checkBoxLabel: string;
  onCheck: () => void;
}

const CheckBoxWrapper = styled.div((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
  label: {
    marginLeft: props.theme.spacing(5),
  },
}));

function CheckBox(props: CheckBoxProps): JSX.Element {
  const {
    isChecked, checkBoxId, checkBoxLabel, onCheck,
  } = props;
  return (
    <CheckBoxWrapper>
      <input id={checkBoxId} type="checkbox" checked={isChecked} onChange={onCheck} />
      <label htmlFor={checkBoxId}>{checkBoxLabel}</label>
    </CheckBoxWrapper>
  );
}

export default CheckBox;
