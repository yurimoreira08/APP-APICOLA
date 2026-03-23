import { useEffect, useState } from "react";
import {
  authenticateUser,
  clearAppSession,
  createUserAccount,
  getAppSession,
  initDb,
  setAppSession,
} from "./database/db";
import { StyleSheet, View, TouchableOpacity, Platform, BackHandler, SafeAreaView, Text } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { MenuScreen } from "./src/screens/MenuScreen";
import { ListaApiariosScreen } from "./src/screens/ListaApiariosScreen";
import { ApiarioScreen } from "./src/screens/ApiarioScreen";
import { ListaRevisoesScreen } from "./src/screens/ListaRevisoesScreen";
import { RevisaoFormScreen } from "./src/screens/RevisaoFormScreen";
import { ConfiguracoesScreen } from "./src/screens/ConfiguracoesScreen";
import { ManejoScreen } from "./src/screens/ManejoScreen";
import { CaixasGeralScreen } from "./src/screens/CaixasGeralScreen";
import { EscolhaAcaoScreen } from "./src/screens/EscolhaAcaoScreen";
import { IscagemScreen } from "./src/screens/IscagemScreen";
import { IscagemFormScreen } from "./src/screens/IscagemFormScreen";
import { OpeningScreen } from "./src/screens/OpeningScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { SignupScreen } from "./src/screens/SignupScreen";
import { RelatoriosScreen } from "./src/screens/RelatoriosScreen";
import { VoltarCasaScreen } from "./src/screens/VoltarCasaScreen";
import { setWebPreviewModeActive } from "./src/runtime/webPreviewMode";

import type { Apiario } from "./src/types/Apiario";
import type { Revisao } from "./src/types/Revisao";

type ScreenName = 
  | "menu" 
  | "apiarios" 
  | "apiario_form" 
  | "escolha_acao"
  | "apiarios_revisao"
  | "apiarios_manejo"
  | "revisoes" 
  | "revisao_form"
  | "manejo_sugestoes"
  | "caixas"
  | "iscagem"
  | "iscagem_form"
  | "configuracoes"
  | "relatorios"
  | "voltar_casa";

type ApiarioFormOrigin = "apiarios" | "apiarios_revisao";
type AuthView = "opening" | "login" | "signup";

import { C } from "./src/theme/colors";
import { T } from "./src/theme/typography";

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
  const [bootError, setBootError] = useState<string | null>(null);
  const [webPreviewMode, setWebPreviewMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("opening");
  
  const [editingApiario, setEditingApiario] = useState<Apiario | undefined>(undefined);
  const [selectedApiario, setSelectedApiario] = useState<Apiario | undefined>(undefined);
  const [editingRevisao, setEditingRevisao] = useState<Revisao | undefined>(undefined);
  // Default caixa for when doing a revision of a specific box from the Caixas screen
  const [selectedCaixa, setSelectedCaixa] = useState<number | undefined>(undefined);
  const [caixasBackScreen, setCaixasBackScreen] = useState<"menu" | "apiarios_revisao">("menu");
  const [apiarioFormOrigin, setApiarioFormOrigin] = useState<ApiarioFormOrigin>("apiarios");

  const boot = async () => {
    try {
      setBootError(null);
      setWebPreviewModeActive(false);
      await initDb();
      const session = await getAppSession();
      setIsAuthenticated(session.isLoggedIn);
      setWebPreviewMode(false);
      setDbReady(true);
    } catch (e: any) {
      if (Platform.OS === "web") {
        console.warn("SQLite indisponível no Web; iniciando modo preview com mock de dados.");
        setWebPreviewModeActive(true);
        setWebPreviewMode(true);
        setIsAuthenticated(true);
        setBootError(null);
        setDbReady(true);
        return;
      }

      setBootError(e?.message || "Falha ao inicializar banco de dados local.");
      setDbReady(true);
    }
  };

  useEffect(() => {
    void boot();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        if (authView === "signup") {
          setAuthView("login");
          return true;
        }
        return false;
      });

      return () => backHandler.remove();
    }

    const backAction = () => {
      if (screen === "menu") return false; // Default behavior (exit app)
      
      if (screen === "configuracoes" || screen === "apiarios" || screen === "relatorios" || screen === "voltar_casa") {
        setScreen("menu");
      } else if (screen === "caixas") {
        setScreen(caixasBackScreen);
      } else if (screen === "escolha_acao") {
        setScreen("menu");
      } else if (screen === "apiarios_revisao" || screen === "apiarios_manejo") {
        setScreen("escolha_acao");
      } else if (screen === "apiario_form") {
        setScreen(apiarioFormOrigin);
      } else if (screen === "manejo_sugestoes") {
        setScreen("apiarios_manejo");
      } else if (screen === "revisoes") {
        if (selectedCaixa !== undefined) setScreen("caixas");
        else setScreen("apiarios_revisao");
      } else if (screen === "revisao_form") {
        setScreen("revisoes");
      } else if (screen === "iscagem_form") {
        setScreen("iscagem");
      } else if (screen === "iscagem") {
        setScreen("menu");
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
  }, [isAuthenticated, authView, screen, selectedCaixa, caixasBackScreen, apiarioFormOrigin]);

  if (!dbReady) {
    return null; /* Optional splash screen */
  }

  if (bootError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.bootErrorWrap}>
          <Text style={styles.bootErrorTitle}>Falha ao iniciar o app</Text>
          <Text style={styles.bootErrorText}>{bootError}</Text>
          <TouchableOpacity style={styles.bootRetryBtn} onPress={() => void boot()}>
            <Text style={styles.bootRetryBtnText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleContinueLocal = async () => {
    await setAppSession({ isLoggedIn: true, authMode: "local" });
    setIsAuthenticated(true);
  };

  const handleLoginCloud = async (email: string, senha: string) => {
    const user = await authenticateUser(email, senha);
    if (!user) {
      throw new Error("Usuário ou senha inválidos.");
    }

    await setAppSession({ isLoggedIn: true, authMode: "cloud", userId: user.id });
    setIsAuthenticated(true);
  };

  const handleSignupCloud = async (nome: string, email: string, senha: string) => {
    const user = await createUserAccount(nome, email, senha);
    await setAppSession({ isLoggedIn: true, authMode: "cloud", userId: user.id });
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    if (webPreviewMode) {
      setScreen("menu");
      return;
    }

    await clearAppSession();
    setIsAuthenticated(false);
    setAuthView("login");
    setScreen("menu");
  };

  const navigateWithPreviewGuard = (nextScreen: ScreenName) => {
    setScreen(nextScreen);
  };

  if (!isAuthenticated) {
    if (authView === "opening") {
      return <OpeningScreen onDone={() => setAuthView("login")} />;
    }

    if (authView === "signup") {
      return (
        <SignupScreen
          onSignupCloud={handleSignupCloud}
          onBackToLogin={() => setAuthView("login")}
        />
      );
    }

    return (
      <LoginScreen
        onLoginCloud={handleLoginCloud}
        onContinueLocal={handleContinueLocal}
        onGoToSignup={() => setAuthView("signup")}
      />
    );
  }

  const renderScreen = () => {
    if (screen === "menu") {
      return (
        <MenuScreen 
          onGoToIscagem={() => navigateWithPreviewGuard("iscagem")}
          onGoToVerApiarios={() => navigateWithPreviewGuard("apiarios")}
          onGoToRevisoesManejo={() => navigateWithPreviewGuard("escolha_acao")}
          onGoToRelatorios={() => navigateWithPreviewGuard("relatorios")}
          onGoToVoltarCasa={() => navigateWithPreviewGuard("voltar_casa")}
          onGoToCaixas={() => {
            if (webPreviewMode) {
              navigateWithPreviewGuard("caixas");
              return;
            }
            setCaixasBackScreen("menu");
            setSelectedApiario(undefined);
            setSelectedCaixa(undefined);
            setScreen("caixas");
          }}
        />
      );
    }

    if (screen === "relatorios") {
      return <RelatoriosScreen onBack={() => setScreen("menu")} />;
    }

    if (screen === "voltar_casa") {
      return <VoltarCasaScreen onBack={() => setScreen("menu")} />;
    }

    if (screen === "iscagem") {
      return (
        <IscagemScreen
          onBack={() => setScreen("menu")}
          onNovaIscagem={() => setScreen("iscagem_form")}
        />
      );
    }

    if (screen === "iscagem_form") {
      return (
        <IscagemFormScreen
          onBack={() => setScreen("iscagem")}
          onDone={() => setScreen("iscagem")}
        />
      );
    }

    if (screen === "escolha_acao") {
      return (
        <EscolhaAcaoScreen
          onBack={() => setScreen("menu")}
          onEscolherRevisao={() => setScreen("apiarios_revisao")}
          onEscolherManejo={() => setScreen("apiarios_manejo")}
        />
      );
    }
  
    if (screen === "configuracoes") {
      return <ConfiguracoesScreen onBack={() => setScreen("menu")} onLogout={handleLogout} />;
    }
  
    if (screen === "apiarios") {
      return (
        <ListaApiariosScreen 
          onNewApiario={() => {
            setEditingApiario(undefined);
            setApiarioFormOrigin("apiarios");
            setScreen("apiario_form");
          }}
          onEditApiario={(apiario) => {
            setEditingApiario(apiario);
            setApiarioFormOrigin("apiarios");
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
          onBack={() => setScreen(apiarioFormOrigin)}
          onNavigateToList={() => {
            setEditingApiario(undefined);
            setScreen(apiarioFormOrigin);
          }}
        />
      );
    }
  
    if (screen === "apiarios_revisao") {
      return (
        <ListaApiariosScreen 
          isRevisaoMode
          onSelectRevisao={(apiario) => {
            setSelectedApiario(apiario);
            setSelectedCaixa(undefined); // Full apiary revision history
            setScreen("revisoes");
          }}
          onEditApiario={(apiario) => {
            setEditingApiario(apiario);
            setApiarioFormOrigin("apiarios_revisao");
            setScreen("apiario_form");
          }}
          onSelectCaixas={(apiario) => {
            setSelectedApiario(apiario);
            setSelectedCaixa(undefined);
            setCaixasBackScreen("apiarios_revisao");
            setScreen("caixas");
          }}
          onBack={() => setScreen("escolha_acao")}
        />
      );
    }

    if (screen === "apiarios_manejo") {
      return (
        <ListaApiariosScreen
          isManejoMode
          onSelectManejo={(apiario) => {
            setSelectedApiario(apiario);
            setScreen("manejo_sugestoes");
          }}
          onBack={() => setScreen("escolha_acao")}
        />
      );
    }
  
    if (screen === "manejo_sugestoes") {
      return (
        <ManejoScreen 
          apiario={selectedApiario}
          onBack={() => setScreen("apiarios_manejo")}
        />
      );
    }
  
    if (screen === "caixas") {
      return (
        <CaixasGeralScreen 
          apiarioIdFiltro={selectedApiario?.id ? String(selectedApiario.id) : undefined}
          onFazerRevisao={(apiarioId, caixa, apiarioNome) => {
            // Find the apiario if possible, but actually we need apiario complete?
            // Using a simple object just with Id to satisfy the apiario prop, 
            // since we only really need its ID to save the new revisao.
            setSelectedApiario({ id: parseInt(apiarioId), nome: apiarioNome || "" } as any); 
            setSelectedCaixa(caixa);
            setScreen("revisoes");
          }}
          onBack={() => setScreen(caixasBackScreen)}
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
            else setScreen("apiarios_revisao");
          }}
        />
      );
    }
  
    if (screen === "revisao_form") {
      return (
        <RevisaoFormScreen 
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
          {webPreviewMode ? (
            <View style={styles.previewBanner}>
              <Text style={styles.previewBannerText}>
                Modo visualizacao Web ativo: dados estao vindo de mock local em memoria.
              </Text>
            </View>
          ) : null}
          {renderScreen()}
        </View>

        <View style={styles.footerWrap}>
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.footerBtn, screen === "menu" ? styles.footerBtnActive : null]}
              onPress={() => navigateWithPreviewGuard("menu")}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Ir para início"
            >
              <View style={[styles.footerIconWrap, screen === "menu" ? styles.footerIconWrapActive : null]}>
                <Ionicons name="home-outline" size={30} color={C.text} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.footerBtn, screen === "configuracoes" ? styles.footerBtnActive : null]}
              onPress={() => navigateWithPreviewGuard("configuracoes")}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Ir para configurações"
            >
              <View style={[styles.footerIconWrap, screen === "configuracoes" ? styles.footerIconWrapActive : null]}>
                <Feather name="settings" size={29} color={C.text} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.surface,
  },
  container: {
    flex: 1,
    backgroundColor: C.surface,
  },
  content: {
    flex: 1,
  },
  previewBanner: {
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.surfaceSoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  previewBannerText: {
    color: C.text,
    textAlign: "center",
    ...T.medium,
  },
  footerWrap: {
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === "ios" ? 16 : 12,
    paddingTop: 6,
    backgroundColor: C.surface,
  },
  footer: {
    flexDirection: "row",
    backgroundColor: C.navBg,
    borderRadius: 28,
    padding: 6,
    borderWidth: 1,
    borderColor: C.cardBorder,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 12px rgba(109, 76, 31, 0.16)",
      },
      default: {
        elevation: 8,
        shadowColor: C.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
  footerBtn: {
    minHeight: 70,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  footerBtnActive: {
    backgroundColor: C.navActive,
  },
  footerIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.surfaceSoft,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  footerIconWrapActive: {
    backgroundColor: C.accent,
    borderColor: C.text,
  },
  bootErrorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    gap: 10,
    backgroundColor: C.bg,
  },
  bootErrorTitle: {
    color: C.text,
    fontSize: 24,
    fontWeight: "800",
    ...T.bold,
  },
  bootErrorText: {
    color: C.textSub,
    textAlign: "center",
    ...T.medium,
  },
  bootRetryBtn: {
    marginTop: 6,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: C.accent,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  bootRetryBtnText: {
    color: C.text,
    fontWeight: "800",
    ...T.bold,
  },
});
