import { useEffect, useState } from "react";
import { initDb } from "./database/db";
import { StyleSheet, View, Text, TouchableOpacity, Platform, BackHandler, SafeAreaView } from "react-native";
import { MenuScreen } from "./src/screens/MenuScreen";
import { ListaApiariosScreen } from "./src/screens/ListaApiariosScreen";
import { ApiarioScreen } from "./src/screens/ApiarioScreen";
import { ListaRevisoesScreen } from "./src/screens/ListaRevisoesScreen";
import { RevisaoScreen } from "./src/screens/RevisaoScreen";
import { ConfiguracoesScreen } from "./src/screens/ConfiguracoesScreen";
import { ManejoScreen } from "./src/screens/ManejoScreen";
import { CaixasGeralScreen } from "./src/screens/CaixasGeralScreen";

import type { Apiario } from "./src/types/Apiario";
import type { Revisao } from "./src/types/Revisao";

type ScreenName = 
  | "menu" 
  | "apiarios" 
  | "apiario_form" 
  | "apiarios_revisao_manejo" 
  | "revisoes" 
  | "revisao_form"
  | "manejo_sugestoes"
  | "caixas"
  | "configuracoes";

import { C } from "./src/theme/colors";

/**
 * Ponto de Entrada Global Mestre (Main App)
 * 
 * @description
 * Gerencia a máquina de estados pura de roteamento (\`screen\`) do aplicativo.
 * Monta o container dinâmico, controla a interceptação do botão Voltar (Android) 
 * via \`BackHandler\` e exibe o Footer de navegação persistente inferior.
 */
export default function App() {
  const [screen, setScreen] = useState<ScreenName>("menu");
  const [dbReady, setDbReady] = useState(false);
  
  const [editingApiario, setEditingApiario] = useState<Apiario | undefined>(undefined);
  const [selectedApiario, setSelectedApiario] = useState<Apiario | undefined>(undefined);
  const [editingRevisao, setEditingRevisao] = useState<Revisao | undefined>(undefined);
  // Default caixa for when doing a revision of a specific box from the Caixas screen
  const [selectedCaixa, setSelectedCaixa] = useState<number | undefined>(undefined);

  useEffect(() => {
    initDb().then(() => setDbReady(true)).catch(console.error);
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (screen === "menu") return false; // Default behavior (exit app)
      
      if (screen === "configuracoes" || screen === "apiarios" || screen === "apiarios_revisao_manejo" || screen === "caixas") {
        setScreen("menu");
      } else if (screen === "apiario_form") {
        setScreen("apiarios");
      } else if (screen === "manejo_sugestoes") {
        setScreen("apiarios_revisao_manejo");
      } else if (screen === "revisoes") {
        if (selectedCaixa !== undefined) setScreen("caixas");
        else setScreen("apiarios_revisao_manejo");
      } else if (screen === "revisao_form") {
        setScreen("revisoes");
      } else {
        setScreen("menu");
      }
      return true; // Used custom behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [screen, selectedCaixa]);

  if (!dbReady) {
    return null; /* Optional splash screen */
  }

  const renderScreen = () => {
    if (screen === "menu") {
      return (
        <MenuScreen 
          onGoToNovoApiario={() => setScreen("apiario_form")}
          onGoToVerApiarios={() => setScreen("apiarios")}
          onGoToRevisoesManejo={() => setScreen("apiarios_revisao_manejo")}
          onGoToCaixas={() => setScreen("caixas")}
        />
      );
    }
  
    if (screen === "configuracoes") {
      return <ConfiguracoesScreen onBack={() => setScreen("menu")} />;
    }
  
    if (screen === "apiarios") {
      return (
        <ListaApiariosScreen 
          onNewApiario={() => {
            setEditingApiario(undefined);
            setScreen("apiario_form");
          }}
          onEditApiario={(apiario) => {
            setEditingApiario(apiario);
            setScreen("apiario_form");
          }}
          onBack={() => setScreen("menu")}
        />
      );
    }
  
    if (screen === "apiario_form") {
      return (
        <ApiarioScreen 
          editingApiario={editingApiario}
          onBack={() => setScreen("apiarios")}
          onNavigateToList={() => {
            setEditingApiario(undefined);
            setScreen("apiarios");
          }}
        />
      );
    }
  
    if (screen === "apiarios_revisao_manejo") {
      return (
        <ListaApiariosScreen 
          isRevisaoManejoMode
          onSelectRevisao={(apiario) => {
            setSelectedApiario(apiario);
            setSelectedCaixa(undefined); // Full apiary revision history
            setScreen("revisoes");
          }}
          onSelectManejo={(apiario) => {
            setSelectedApiario(apiario);
            setScreen("manejo_sugestoes");
          }}
          onBack={() => setScreen("menu")}
        />
      );
    }
  
    if (screen === "manejo_sugestoes") {
      return (
        <ManejoScreen 
          apiario={selectedApiario}
          onBack={() => setScreen("apiarios_revisao_manejo")}
        />
      );
    }
  
    if (screen === "caixas") {
      return (
        <CaixasGeralScreen 
          onFazerRevisao={(apiarioId, caixa) => {
            // Find the apiario if possible, but actually we need apiario complete?
            // Using a simple object just with Id to satisfy the apiario prop, 
            // since we only really need its ID to save the new revisao.
            setSelectedApiario({ id: parseInt(apiarioId), nome: "" } as any); 
            setSelectedCaixa(caixa);
            setScreen("revisoes");
          }}
          onBack={() => setScreen("menu")}
        />
      );
    }
  
    if (screen === "revisoes") {
      return (
        <ListaRevisoesScreen 
          apiario={selectedApiario}
          caixaFiltro={selectedCaixa} // Pass it down to optionally filter or pass to new ones
          onNewRevisao={() => {
            setEditingRevisao(undefined);
            setScreen("revisao_form");
          }}
          onEditRevisao={(revisao) => {
            setEditingRevisao(revisao);
            setScreen("revisao_form");
          }}
          onBack={() => {
            if (selectedCaixa !== undefined) setScreen("caixas");
            else setScreen("apiarios_revisao_manejo");
          }}
        />
      );
    }
  
    if (screen === "revisao_form") {
      return (
        <RevisaoScreen 
          apiario={selectedApiario}
          editingRevisao={editingRevisao}
          defaultCaixa={selectedCaixa}
          onBack={() => setScreen("revisoes")}
          onNavigateToList={() => {
            setEditingRevisao(undefined);
            setScreen("revisoes");
          }} 
        />
      );
    }
  
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          {renderScreen()}
        </View>

        {/* Global Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.footerBtn}
            onPress={() => setScreen("menu")}
            activeOpacity={0.7}
          >
            <Text style={[styles.footerIcon, screen === "menu" ? styles.footerIconActive : null]}>🏠</Text>
            <Text style={[styles.footerText, screen === "menu" ? styles.footerTextActive : null]}>Início</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.footerBtn}
            onPress={() => setScreen("configuracoes")}
            activeOpacity={0.7}
          >
            <Text style={[styles.footerIcon, screen === "configuracoes" ? styles.footerIconActive : null]}>⚙️</Text>
            <Text style={[styles.footerText, screen === "configuracoes" ? styles.footerTextActive : null]}>Configurações</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.card, // Matches footer to blend with safe area bottoms
  },
  container: {
    flex: 1,
    backgroundColor: C.bg, // Main background
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.cardBorder,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    paddingTop: 10,
    justifyContent: "space-around",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerBtn: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  footerIcon: {
    fontSize: 24,
    opacity: 0.6,
  },
  footerIconActive: {
    opacity: 1,
  },
  footerText: {
    fontSize: 12,
    color: C.textSub,
    marginTop: 4,
    fontWeight: "600",
  },
  footerTextActive: {
    color: C.accent,
  }
});
