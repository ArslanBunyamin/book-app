import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useThemeColors from "../data/colors";
import ScaledImg from "../components/ScaledImg";
import CalcDate from "../hooks/CalcDate";
import { useEffect, useState } from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import MasonryList from "@react-native-seoul/masonry-list";
import { useNavigation } from "@react-navigation/native";

const Comment = ({ item: comment, replyHandler }) => {
  const navigation = useNavigation();
  const colors = useThemeColors();
  styles = {
    text: [styleSheet.text, { color: colors.text }],
    icon: [styleSheet.icon, { color: colors.third }],
    comment: [styleSheet.comment, { borderColor: colors.bg3 }],
    pp: [styleSheet.pp, { borderColor: colors.third }],
  };
  const [hasSubComments, sethasSubComments] = useState(false);
  const [subComments, setsubComments] = useState([]);
  const [repliesOpened, setrepliesOpened] = useState(false);

  useEffect(() => {
    if (comment.subComments != undefined) {
      setsubComments(comment.subComments);
    }
  }, [comment]);
  useEffect(() => {
    if (subComments.length != 0) sethasSubComments(true);
  }, [subComments]);

  return (
    <View style={styles.comment}>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          style={{
            marginTop: 4,
            width: 44,
          }}
          onPress={() => {
            navigation.navigate("profile", { user: comment.user });
          }}
          activeOpacity={0.7}
        >
          <ScaledImg
            uri={comment.user.photo}
            style={styles.pp}
            desiredWidth={44}
          />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            marginLeft: 8,
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("profile", { user: comment.user });
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.text, { fontFamily: "Raleway_700Bold" }]}>
                {comment.user.name}
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.text,
                { fontFamily: "Raleway_300Light", opacity: 0.6 },
              ]}
            >
              {CalcDate(comment.timestamp)}
            </Text>
          </View>
          <Text style={[styles.text, { opacity: 0.9, flexWrap: "wrap" }]}>
            {comment.text}
          </Text>
          <TouchableOpacity
            onPress={() =>
              replyHandler({
                username: comment.user.name,
                id: comment.isReply ? comment.parentId : comment.id,
              })
            }
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.text,
                {
                  fontSize: 14,
                  color: colors.first,
                  fontFamily: "Raleway_700Bold",
                  paddingVertical: 4,
                },
              ]}
            >
              reply
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styleSheet.subCommentCont}>
        {repliesOpened ? (
          <View>
            <MasonryList
              data={subComments}
              renderItem={({ item }) => (
                <Comment item={item} replyHandler={replyHandler} />
              )}
              keyExtractor={(item) => item.id}
              numColumns={1}
            />
            <TouchableOpacity
              style={{ flexDirection: "row", flex: 1, paddingVertical: 8 }}
              onPress={() => setrepliesOpened(false)}
              activeOpacity={0.7}
            >
              <AntDesign
                name="totop"
                style={[styles.icon, { verticalAlign: "bottom", fontSize: 16 }]}
              />
              <Text style={[styles.text, { color: colors.third }]}> close</Text>
            </TouchableOpacity>
          </View>
        ) : comment.isReply ? (
          ""
        ) : hasSubComments ? (
          <TouchableOpacity
            style={{ flexDirection: "row", paddingTop: 4 }}
            onPress={() => {
              setrepliesOpened(true);
            }}
            activeOpacity={0.7}
          >
            <Feather name="corner-right-down" size={24} style={styles.icon} />
            <Text
              style={[
                styles.text,
                {
                  color: colors.third,
                  fontFamily: "Raleway_700Bold",
                  fontSize: 15,
                },
              ]}
            >
              {"show " + subComments.length + " replies"}
            </Text>
          </TouchableOpacity>
        ) : (
          ""
        )}
      </View>
    </View>
  );
};

export default Comment;

const styleSheet = StyleSheet.create({
  comment: {
    flex: 1,
    paddingTop: 10,
    borderBottomWidth: 1,
  },
  pp: {
    resizeMode: "contain",
    borderRadius: 50,
  },
  text: {
    fontFamily: "Raleway_500Medium",
    fontSize: 16,
  },
  icon: {
    fontSize: 20,
  },
  subCommentCont: {
    paddingLeft: 20,
    paddingBottom: 8,
  },
});
