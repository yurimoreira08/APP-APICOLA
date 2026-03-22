import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";

import { C } from "../theme/colors";

type Props = {
  onGoToNovoApiario: () => void;
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
  onGoToNovoApiario, 
  onGoToVerApiarios,
  onGoToRevisoesManejo,
  onGoToCaixas
}: Props) => {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
           {/* Placeholder for left align if needed */}
           <View style={{width: 38}} />
        </View>
        <Text style={styles.headerTitle}>🐝 Apícola</Text>
        <Text style={styles.headerSub}>O que você deseja fazer?</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12, paddingBottom: 40 }}>
        
        <TouchableOpacity style={styles.card} onPress={onGoToNovoApiario} activeOpacity={0.8}>
            <Text style={styles.icon}>➕</Text>
            <Text style={styles.cardTitle}>Novo Apiário</Text>
            <Text style={styles.cardDesc}>Adicione local</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={onGoToVerApiarios} activeOpacity={0.8}>
            <Text style={styles.icon}>📋</Text>
            <Text style={styles.cardTitle}>Ver Apiários</Text>
            <Text style={styles.cardDesc}>Gerenciar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={onGoToRevisoesManejo} activeOpacity={0.8}>
          <Text style={styles.icon}>🍯</Text>
          <Text style={styles.cardTitle}>Avaliações</Text>
          <Text style={styles.cardDesc}>Revisar/Manejo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={onGoToCaixas} activeOpacity={0.8}>
            <Text style={styles.icon}>📦</Text>
            <Text style={styles.cardTitle}>Caixas</Text>
            <Text style={styles.cardDesc}>Individuais</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center",
  },
  headerTop: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 20
  },
  iconBtn: {
      padding: 8,
      backgroundColor: C.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.cardBorder,
      position: 'relative'
  },
  smallIcon: {
      fontSize: 20
  },
  notificationDot: {
      width: 10,
      height: 10,
      backgroundColor: C.accent,
      borderRadius: 5,
      position: 'absolute',
      top: 4,
      right: 4,
      borderWidth: 2,
      borderColor: C.card
  },
  headerTitle: { fontSize: 32, fontWeight: "900", color: C.accent },
  headerSub: { fontSize: 16, color: C.textSub, marginTop: 8 },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    gap: 8,
    width: "48%",
  },
  icon: {
    fontSize: 40,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.text,
    textAlign: "center"
  },
  cardDesc: {
    fontSize: 12,
    color: C.textSub,
    textAlign: "center",
  },
});
