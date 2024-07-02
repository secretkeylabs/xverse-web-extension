import styled, { css } from 'styled-components';

const TabContainer = styled.div`
  display: flex;
  gap: ${(props) => props.theme.space.xxs};
`;

const TabItem = styled.div<{ $active?: boolean }>`
  padding: 7px 12px 8px;
  border-radius: 12px;
  ${(props) => props.theme.typography.body_bold_s};
  color: ${(props) => props.theme.colors.white_200};
  text-transform: uppercase;
  cursor: pointer;
  user-select: none;
  transition: color 0.1s ease;

  ${({ $active }) =>
    $active
      ? css`
          color: ${(props) => props.theme.colors.white_0};
          background-color: ${({ theme }) => theme.colors.elevation3};
          cursor: default;
        `
      : css`
          &:hover {
            color: ${(props) => props.theme.colors.white_0};
          }
        `}
`;

interface TabProps<T> {
  tabs: { label: string; value: T }[];
  activeTab: T;
  onTabClick: (value: T) => void;
  className?: string;
}
function Tabs<T extends unknown>({ tabs, activeTab, onTabClick, className }: TabProps<T>) {
  return (
    <TabContainer className={className}>
      {tabs.map((tab: { label: string; value: T }) => (
        <TabItem
          key={String(tab.value)}
          $active={activeTab === tab.value}
          onClick={() => onTabClick(tab.value)}
        >
          {tab.label}
        </TabItem>
      ))}
    </TabContainer>
  );
}

export default Tabs;
