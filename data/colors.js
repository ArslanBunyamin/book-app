import { useColorScheme } from "react-native";

const Colors = {
  light: {
    first: "#c52233",
    second: "#a51c30",
    third: "#a7333f",
    fourth: "#a51c30cc",
    fifth: "#c7333fcc",
    bg: "#eee",
    bg2: "#ddd",
    bg3: "#cdcdcd",
    text: "#031926",
    placeholder: "#aaa",
  },
  dark: {
    first: "#c52233",
    second: "#a51c30",
    third: "#a7333f",
    fourth: "#84121d",
    fifth: "#680c1f",
    bg: "#1d1d1d",
    bg2: "#272727",
    bg3: "#2d2d2d",
    text: "#eee",
    placeholder: "#3d3d3d",
  },
};

const useThemeColors = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return colors;
};

export default useThemeColors;
