import styled, { css } from 'styled-components';

const TabContainer = styled.div`
  display: flex;
  gap: ${(props) => props.theme.space.xxs};
`;

export const TabItem = styled.button<{ $active?: boolean }>`
  ${(props) => props.theme.typography.body_bold_s};
  padding: ${(props) => props.theme.space.xs} ${(props) => props.theme.space.s};
  border-radius: 12px;
  color: ${(props) => props.theme.colors.white_200};
  text-transform: uppercase;
  background-color: transparent;
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

export type TabProp<T> = { label: string; value: T };

type TabsProps<T> = {
  tabs: TabProp<T>[];
  activeTab: T;
  onTabClick: (value: T) => void;
  className?: string;
};

export function Tabs<T extends unknown>({ tabs, activeTab, onTabClick, className }: TabsProps<T>) {
  return (
    <TabContainer className={className}>
      {tabs.map((tab) => (
        <TabItem
          key={tab.label}
          $active={activeTab === tab.value}
          onClick={() => onTabClick(tab.value)}
        >
          {tab.label}
        </TabItem>
      ))}
    </TabContainer>
  );
}
