import { useState } from "react";
import { Image } from "react-native";

export default ScaledImg = ({ style, uri, desiredWidth }) => {
  const [desiredHeight, setDesiredHeight] = useState(0);

  Image.getSize(uri, (width, height) => {
    setDesiredHeight((desiredWidth / width) * height);
  });

  return (
    <Image
      source={{ uri: uri }}
      style={[
        {
          height: desiredHeight,
        },
        style,
      ]}
    />
  );
};
