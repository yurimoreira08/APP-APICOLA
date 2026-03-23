import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { C } from "../theme/colors";
import { T } from "../theme/typography";

type Props = {
  onDone: () => void;
};

const appLogo = require("../../assets/splash-icon.png");

export const OpeningScreen = ({ onDone }: Props) => {
  useEffect(() => {
    const id = setTimeout(onDone, 1400);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <Image source={appLogo} style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={styles.brand}>From Boiles</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 72,
    paddingBottom: 44,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 280,
    height: 280,
  },
  brand: {
    fontSize: 18,
    color: C.text,
    fontWeight: "700",
    ...T.bold,
  },
});
