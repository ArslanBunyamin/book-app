import { useColorScheme } from "react-native";

const Colors = {
  light: {
    first: "#c52233",
    second: "#a51c30",
    third: "#a7333f",
    fourth: "#a51c30cc",
    fifth: "#c7333fcc",
    bg: "#eee",
    transparentBg: "#eee8",
    text: "#031926",
  },
  dark: {
    first: "#c52233",
    second: "#a51c30",
    third: "#a7333f",
    fourth: "#84121d",
    fifth: "#680c1f",
    bg: "#1d1d1d",
    transparentBg: "#1d1d1d88",
    text: "#eee",
  },
};

const useThemeColors = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return colors;
};

export default useThemeColors;
