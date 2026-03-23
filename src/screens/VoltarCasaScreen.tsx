import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Speech from "expo-speech";

import { C } from "../theme/colors";
import { T } from "../theme/typography";
import { safePointService } from "../services/safePointService";
import type { SafePoint } from "../../database/db";

type Props = {
  onBack: () => void;
};

type Coord = {
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_KM = 6371;
const WALKING_SPEED_KMH = 4;

const toRad = (value: number) => (value * Math.PI) / 180;

const haversineKm = (a: Coord, b: Coord): number => {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const bearingDegrees = (from: Coord, to: Coord): number => {
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const dLon = toRad(to.longitude - from.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
};

const bearingToDirection = (bearing: number): string => {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const index = Math.round(bearing / 45) % 8;
  return dirs[index];
};

const formatCoord = (value: number) => value.toFixed(6);

export const VoltarCasaScreen = ({ onBack }: Props) => {
  const [location, setLocation] = useState<Coord | null>(null);
  const [safePoints, setSafePoints] = useState<SafePoint[]>([]);
  const [activePoint, setActivePoint] = useState<SafePoint | null>(null);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const loadSafePoints = useCallback(async () => {
    const points = await safePointService.list();
    setSafePoints(points);
    setActivePoint(points.find((p) => p.isDefault) || points[0] || null);
  }, []);

  const loadLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setPermissionGranted(false);
      throw new Error("Permissão de localização negada.");
    }

    setPermissionGranted(true);
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    setLocation({
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    });
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        await Promise.all([loadSafePoints(), loadLocation()]);
      } catch (e: any) {
        Alert.alert("Localização", e?.message || "Não foi possível obter localização atual.");
      }
    };

    void boot();
  }, [loadLocation, loadSafePoints]);

  const distanceKm = useMemo(() => {
    if (!location || !activePoint) return null;
    return haversineKm(location, { latitude: activePoint.latitude, longitude: activePoint.longitude });
  }, [location, activePoint]);

  const etaMinutes = useMemo(() => {
    if (distanceKm === null) return null;
    return Math.round((distanceKm / WALKING_SPEED_KMH) * 60);
  }, [distanceKm]);

  const directionLabel = useMemo(() => {
    if (!location || !activePoint) return null;
    const bearing = bearingDegrees(location, { latitude: activePoint.latitude, longitude: activePoint.longitude });
    return `${bearingToDirection(bearing)} (${Math.round(bearing)}°)`;
  }, [location, activePoint]);

  const handleMarkCurrentPoint = async () => {
    try {
      if (!location) {
        await loadLocation();
      }
      if (!location) return;

      const now = new Date();
      const nome = `Ponto ${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

      await safePointService.create(nome, location.latitude, location.longitude, safePoints.length === 0);
      await loadSafePoints();
      Alert.alert("Ponto salvo", "Ponto seguro registrado com sucesso.");
    } catch (e: any) {
      Alert.alert("Falha ao salvar", e?.message || "Não foi possível salvar o ponto seguro.");
    }
  };

  const handleSetDefault = async (id: number) => {
    await safePointService.setDefault(id);
    await loadSafePoints();
  };

  const handleDeletePoint = (id: number) => {
    Alert.alert("Excluir ponto", "Deseja remover este ponto seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await safePointService.remove(id);
          await loadSafePoints();
        },
      },
    ]);
  };

  const handleRefreshLocation = async () => {
    try {
      await loadLocation();
    } catch (e: any) {
      Alert.alert("GPS", e?.message || "Falha ao atualizar localização.");
    }
  };

  const handleSpeakGuidance = () => {
    if (!activePoint || distanceKm === null || etaMinutes === null || !directionLabel) {
      Alert.alert("Rota indisponível", "Defina um ponto seguro e atualize sua localização.");
      return;
    }

    const text = `Siga na direção ${directionLabel}. Distância aproximada de ${distanceKm.toFixed(
      2,
    )} quilômetros. Tempo estimado de ${etaMinutes} minutos.`;
    Speech.speak(text, { language: "pt-BR", pitch: 1, rate: 0.95 });
  };

  const handleEmergencyCall = async () => {
    const url = "tel:193";
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("Ligação indisponível", "Seu dispositivo não permite ligação direta.");
      return;
    }
    await Linking.openURL(url);
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voltar pra Casa</Text>
        <Feather name="bell" size={20} color={C.text} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.mainBtn} onPress={handleMarkCurrentPoint}>
          <Text style={styles.mainBtnText}>Marcar ponto seguro atual</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainBtn} onPress={handleRefreshLocation}>
          <Text style={styles.mainBtnText}>Atualizar localização GPS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainBtn} onPress={handleSpeakGuidance}>
          <Text style={styles.mainBtnText}>Voltar pra casa (orientação por voz)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainBtn, styles.emergencyBtn]}
          onPress={() => setEmergencyMode((v) => !v)}
        >
          <Text style={styles.mainBtnText}>{emergencyMode ? "Sair do modo emergência" : "Modo emergência"}</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Prévia de navegação</Text>
          <Text style={styles.cardText}>Permissão GPS: {permissionGranted ? "autorizada" : "pendente"}</Text>
          <Text style={styles.cardText}>
            Posição atual: {location ? `${formatCoord(location.latitude)}, ${formatCoord(location.longitude)}` : "--"}
          </Text>
          <Text style={styles.cardText}>Ponto alvo: {activePoint?.nome || "Nenhum ponto definido"}</Text>
          <Text style={styles.cardText}>Direção: {directionLabel || "--"}</Text>
          <Text style={styles.cardText}>Distância: {distanceKm !== null ? `${distanceKm.toFixed(2)} km` : "--"}</Text>
          <Text style={styles.cardText}>Tempo estimado: {etaMinutes !== null ? `${etaMinutes} min` : "--"}</Text>
        </View>

        {location && activePoint ? (
          <View style={styles.mapWrap}>
            <View style={styles.mapFallback}>
              <Text style={styles.cardTitle}>Pré-visualização do mapa</Text>
              {Platform.OS === "web" ? (
                <Text style={styles.cardText}>
                  No Web, a visualização nativa de mapa foi desativada para compatibilidade. A rota e direção continuam disponíveis.
                </Text>
              ) : (
                <Text style={styles.cardText}>
                  Mapa nativo será reativado em uma etapa dedicada de compatibilidade por plataforma.
                </Text>
              )}
              <Text style={styles.cardText}>Origem: Você ({formatCoord(location.latitude)}, {formatCoord(location.longitude)})</Text>
              <Text style={styles.cardText}>Destino: {activePoint.nome} ({formatCoord(activePoint.latitude)}, {formatCoord(activePoint.longitude)})</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pontos seguros salvos</Text>
          {safePoints.length === 0 ? (
            <Text style={styles.cardText}>Nenhum ponto salvo ainda.</Text>
          ) : (
            safePoints.map((point) => (
              <View key={point.id} style={styles.pointRow}>
                <View style={styles.pointInfo}>
                  <Text style={styles.pointName}>{point.nome}{point.isDefault ? " (padrão)" : ""}</Text>
                  <Text style={styles.pointCoord}>{formatCoord(point.latitude)}, {formatCoord(point.longitude)}</Text>
                </View>

                <View style={styles.pointActions}>
                  {!point.isDefault ? (
                    <TouchableOpacity style={styles.smallBtn} onPress={() => handleSetDefault(point.id)}>
                      <Text style={styles.smallBtnText}>Padrão</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity style={[styles.smallBtn, styles.deleteBtn]} onPress={() => handleDeletePoint(point.id)}>
                    <Text style={styles.deleteBtnText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {emergencyMode ? (
          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyTitle}>Modo Emergência Ativo</Text>
            <Text style={styles.emergencyArrow}>➤ {directionLabel || "--"}</Text>
            <Text style={styles.cardText}>Distância: {distanceKm !== null ? `${distanceKm.toFixed(2)} km` : "--"}</Text>
            <Text style={styles.cardText}>Tempo: {etaMinutes !== null ? `${etaMinutes} min` : "--"}</Text>

            <TouchableOpacity style={styles.mainBtn} onPress={handleSpeakGuidance}>
              <Text style={styles.mainBtnText}>Comando de voz do GPS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.mainBtn, styles.callBtn]} onPress={handleEmergencyCall}>
              <Text style={styles.mainBtnText}>Ligar emergência (193)</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: {
    paddingTop: 54,
    paddingBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: C.navBg,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: C.text,
    ...T.bold,
  },
  content: {
    padding: 20,
    gap: 12,
    paddingBottom: 44,
  },
  mainBtn: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: C.accent,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyBtn: {
    backgroundColor: "#f7e6cf",
  },
  mainBtnText: {
    color: C.text,
    fontWeight: "800",
    ...T.bold,
  },
  card: {
    marginTop: 4,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  cardTitle: {
    color: C.text,
    fontWeight: "800",
    fontSize: 17,
    ...T.bold,
  },
  cardText: {
    color: C.text,
    ...T.medium,
  },
  mapWrap: {
    height: 260,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  map: {
    flex: 1,
  },
  mapFallback: {
    flex: 1,
    backgroundColor: C.surfaceSoft,
    padding: 12,
    gap: 6,
  },
  pointRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.cardBorder,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  pointInfo: { flex: 1 },
  pointName: {
    color: C.text,
    fontWeight: "700",
    ...T.medium,
  },
  pointCoord: {
    color: C.textSub,
    fontSize: 12,
    ...T.medium,
  },
  pointActions: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  smallBtn: {
    minHeight: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.inputBg,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnText: {
    color: C.text,
    fontSize: 12,
    fontWeight: "700",
    ...T.medium,
  },
  deleteBtn: {
    backgroundColor: "#f7e6cf",
  },
  deleteBtnText: {
    color: C.red,
    fontSize: 12,
    fontWeight: "700",
    ...T.medium,
  },
  emergencyCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  emergencyTitle: {
    color: C.red,
    fontWeight: "800",
    fontSize: 18,
    ...T.bold,
  },
  emergencyArrow: {
    color: C.text,
    fontWeight: "800",
    fontSize: 26,
    ...T.bold,
  },
  callBtn: {
    backgroundColor: "#f7e6cf",
  },
});
