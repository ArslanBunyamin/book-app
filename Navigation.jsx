import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./screens/Home";
import { StatusBar } from "expo-status-bar";
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
      initialRouteName="home"
      screenOptions={({ route, navigation }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarInactiveTintColor: "white",
        tabBarActiveTintColor: "lightblue",
        tabBarStyle: {
          backgroundColor: colors.bg,
          height: 60,
          borderColor: "transparent",
        },
        tabBarIcon: ({ color, focused, size }) => {
          let routeName = route.name;

          if (routeName == "profile") {
            return (
              <FontAwesome5
                name={focused ? "user-alt" : "user"}
                size={24}
                color={colors.second}
              />
            );
          }
          return (
            <Ionicons
              name={focused ? routeName : routeName + "-outline"}
              size={28}
              color={colors.second}
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
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerShown: false,
        })}
      >
        <Stack.Screen name="loading" component={Loading} />
        <Stack.Screen name="tabGroup" component={TabGroup} />
        <Stack.Screen name="login" component={Login} />
        <Stack.Screen name="book" component={Book} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
};

export default Navigation;
