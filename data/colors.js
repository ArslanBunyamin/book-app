import { useColorScheme } from "react-native";

const Colors = {
  light: {
    first: "#468189",
    firstBg: "#46818933",
    second: "#77aca2",
    secondBg: "#77aca233",
    third: "#9dbebb",
    thirdBg: "#9dbebb33",
    bg: "#eee",
    text: "#031926",
  },
  dark: {
    first: "#9dbebb",
    firstBg: "#9dbebb33",
    second: "#77aca2",
    secondBg: "#77aca233",
    third: "#468189",
    thirdBg: "#46818933",
    bg: "#031926",
    text: "#eee",
  },
};

const useThemeColors = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return colors;
};

export default useThemeColors;
