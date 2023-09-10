import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./screens/Home";
import Favourites from "./screens/Favourites";
import Book from "./screens/Book";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import Login from "./screens/Login";
import Profile from "./screens/Profile";
import Loading from "./screens/Loading";
import useThemeColors from "./data/colors";

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

          if (routeName == "profile") {
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
      <Tab.Screen name="profile" component={Profile} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
