import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { C } from "../theme/colors";
import { T } from "../theme/typography";

const appLogo = require("../../assets/splash-icon.png");

type Props = {
  onGoToIscagem: () => void;
  onGoToVerApiarios: () => void;
  onGoToRevisoesManejo: () => void;
  onGoToCaixas: () => void;
};

/**
 * Tela do Menu Principal (Home)
 * 
 * @description
 * Apresenta o menu de navegação central do aplicativo. Permite que o usuário
 * escolha criar novos locais, gerenciar locais existentes, realizar revisões ou 
 * vistoriar configurações de caixas individuais.
 * 
 * @param {Props} props Propriedades do componente, contendo as funções de roteamento.
 */
export const MenuScreen = ({ 
  onGoToIscagem,
  onGoToVerApiarios,
  onGoToRevisoesManejo,
  onGoToCaixas
}: Props) => {
  const actionIconSize = 30;
  const actions = [
    { label: "Cadastro de Apiários", icon: <Feather name="map-pin" size={actionIconSize} color={C.text} />, onPress: onGoToVerApiarios },
    { label: "Revisão e Manejo", icon: <MaterialCommunityIcons name="beehive-outline" size={actionIconSize} color={C.text} />, onPress: onGoToRevisoesManejo },
    { label: "Relatórios", icon: <Feather name="bar-chart-2" size={actionIconSize} color={C.text} />, onPress: onGoToRevisoesManejo },
    { label: "Iscagem", icon: <MaterialCommunityIcons name="target" size={actionIconSize} color={C.text} />, onPress: onGoToIscagem },
    { label: "Caixas", icon: <Feather name="archive" size={actionIconSize} color={C.text} />, onPress: onGoToCaixas },
    { label: "Início", icon: <Feather name="home" size={actionIconSize} color={C.text} />, onPress: onGoToVerApiarios },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Image source={appLogo} style={styles.topLogo} resizeMode="contain" />
          <Text style={styles.topTitle}>Apícola</Text>
        </View>
        <Feather name="bell" size={26} color={C.text} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.card}
            onPress={action.onPress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <View style={styles.cardIcon}>{action.icon}</View>
            <Text style={styles.cardTitle}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  topBar: {
    paddingTop: 56,
    paddingBottom: 14,
    paddingHorizontal: 18,
    backgroundColor: C.navBg,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  topLogo: {
    width: 84,
    height: 84,
  },
  topTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: C.text,
    ...T.bold,
  },
  topIcon: {
    fontSize: 20,
    color: C.text,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 40,
    rowGap: 12,
  },
  card: {
    width: "48.5%",
    minHeight: 124,
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIcon: {
    marginBottom: 10,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: C.surfaceSoft,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "700",
    color: C.text,
    textAlign: "center",
    ...T.medium,
  },
});
