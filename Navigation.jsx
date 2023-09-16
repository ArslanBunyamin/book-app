import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./screens/Home";
import Favourites from "./screens/Favourites";
import Book from "./screens/Book";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import Login from "./screens/Login";
import MyProfile from "./screens/MyProfile";
import Loading from "./screens/Loading";
import useThemeColors from "./data/colors";
import Profile from "./screens/Profile";
import Chat from "./screens/Chat";
import MyChats from "./screens/MyChats";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabGroup = () => {
  const colors = useThemeColors();
  return (
    <Tab.Navigator
      initialRouteName="library"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarInactiveTintColor: "red",
        tabBarActiveTintColor: "red",
        tabBarStyle: {
          backgroundColor: colors.bg,
          height: 52,
          borderColor: "transparent",
        },
        tabBarIcon: ({ focused }) => {
          let routeName = route.name;

          if (routeName == "myProfile") {
            return (
              <FontAwesome5
                name={focused ? "user-alt" : "user"}
                size={24}
                color={colors.third}
              />
            );
          }
          return (
            <Ionicons
              name={focused ? routeName : routeName + "-outline"}
              size={28}
              color={colors.third}
            />
          );
        },
      })}
    >
      <Tab.Screen name="library" component={Home} />
      <Tab.Screen name="bookmark" component={Favourites} />
      <Tab.Screen name="md-chatbubbles" component={MyChats} />
      <Tab.Screen name="myProfile" component={MyProfile} />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const horizontalAnimation = {
    cardStyleInterpolator: ({ current, layouts }) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  };
  const reverseHorizontalAnimation = {
    cardStyleInterpolator: ({ current, layouts }) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: true,
          headerShown: false,
        }}
      >
        <Stack.Screen name="loading" component={Loading} />
        <Stack.Screen name="login" component={Login} />
        <Stack.Screen
          name="tabGroup"
          component={TabGroup}
          options={horizontalAnimation}
        />
        <Stack.Screen
          name="book"
          component={Book}
          options={horizontalAnimation}
        />
        <Stack.Screen
          name="profile"
          component={Profile}
          options={horizontalAnimation}
        />
        <Stack.Screen
          name="chat"
          component={Chat}
          options={reverseHorizontalAnimation}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
