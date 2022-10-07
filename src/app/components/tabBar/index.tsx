import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AccountList from '@screens/accountList';
import Home from '@screens/home';


function BottomBar() {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator>
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen name="Settings" component={AccountList} />
  </Tab.Navigator>
  );
}

export default BottomBar;
