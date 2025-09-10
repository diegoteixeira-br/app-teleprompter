import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import Camera, { CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Play, Square, RotateCcw, Minus, Plus, Timer, SkipBack } from 'lucide-react-native';
import TeleprompterOverlay from '@/components/TeleprompterOverlay';
import CountdownTimer from '@/components/CountdownTimer';
import { useScript } from '@/context/ScriptContext';

export default function RecordingScreen() {
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [microphonePermission, setMicrophonePermission] = useState<boolean | null>(null);
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [isRecording, setIsRecording] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50); // pixels per second
  const [fontSize, setFontSize] = useState(24);
  const [countdownTime, setCountdownTime] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const teleprompterRef = useRef<any>(null);
  
  const { currentScript } = useScript();

  useEffect(() => {
    requestPermissions();
    if (!mediaLibraryPermission) {
      requestMediaLibraryPermission();
    }
  }, []);

  const requestPermissions = async () => {
    try {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const microphoneStatus = await Camera.requestMicrophonePermissionsAsync();
      
      setCameraPermission(cameraStatus.status === 'granted');
      setMicrophonePermission(microphoneStatus.status === 'granted');
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setCameraPermission(false);
      setMicrophonePermission(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const startCountdown = () => {
    setShowCountdown(true);
  };

  const onCountdownComplete = () => {
    setShowCountdown(false);
    startRecording();
  };

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;

    try {
      setIsRecording(true);
      setIsRolling(true);
      
      const video = await cameraRef.current.recordAsync({
        quality: Camera.Constants.VideoQuality['1080p'],
        maxDuration: 300, // 5 minutes max
      });

      if (video && video.uri) {
        await MediaLibrary.saveToLibraryAsync(video.uri);
        Alert.alert('Sucesso', 'Vídeo salvo na galeria!');
      }
    } catch (error) {
      console.error('Erro ao gravar:', error);
      Alert.alert('Erro', 'Não foi possível gravar o vídeo.');
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;

    try {
      await cameraRef.current.stopRecording();
      setIsRecording(false);
      setIsRolling(false);
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
    }
  };

  const adjustSpeed = (increment: number) => {
    setScrollSpeed(prev => Math.max(10, Math.min(200, prev + increment)));
  };

  const adjustFontSize = (increment: number) => {
    setFontSize(prev => Math.max(16, Math.min(48, prev + increment)));
  };

  const adjustCountdown = (increment: number) => {
    setCountdownTime(prev => Math.max(0, Math.min(10, prev + increment)));
  };

  const resetTeleprompter = () => {
    if (teleprompterRef.current) {
      teleprompterRef.current.resetScroll();
    }
    setIsRolling(false);
  };

  if (cameraPermission === null || microphonePermission === null) {
    return <View style={styles.loadingContainer}><Text>Carregando...</Text></View>;
  }

  if (!cameraPermission || !microphonePermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Precisamos de permissão para usar a câmera e o microfone
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
          <Text style={styles.permissionButtonText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' || Platform.OS === 'android' ? (
        <View style={styles.cameraContainer}>
          <Camera 
            style={styles.camera} 
            type={facing}
            ref={cameraRef}
          >
            {currentScript && (
              <TeleprompterOverlay
                ref={teleprompterRef}
                script={currentScript}
                fontSize={fontSize}
                scrollSpeed={scrollSpeed}
                isRolling={isRolling}
              />
            )}
            
            {showCountdown && (
              <CountdownTimer
                initialTime={countdownTime}
                onComplete={onCountdownComplete}
              />
            )}
          </Camera>

          {/* Controls Overlay */}
          <View style={styles.controlsOverlay}>
            {/* Top Controls */}
            <View style={styles.topControls}>
              <TouchableOpacity style={styles.controlButton} onPress={resetTeleprompter}>
                <SkipBack size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
                <RotateCcw size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              {/* Controls Row */}
              <View style={styles.controlsRow}>
                {/* Speed Control */}
                <View style={styles.controlGroup}>
                  <Text style={styles.controlLabel}>Velocidade</Text>
                  <View style={styles.controlRow}>
                    <TouchableOpacity 
                      style={styles.smallButton} 
                      onPress={() => adjustSpeed(-10)}
                    >
                      <Minus size={14} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.controlValue}>{scrollSpeed}</Text>
                    <TouchableOpacity 
                      style={styles.smallButton} 
                      onPress={() => adjustSpeed(10)}
                    >
                      <Plus size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Font Size Control */}
                <View style={styles.controlGroup}>
                  <Text style={styles.controlLabel}>Fonte</Text>
                  <View style={styles.controlRow}>
                    <TouchableOpacity 
                      style={styles.smallButton} 
                      onPress={() => adjustFontSize(-2)}
                    >
                      <Minus size={14} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.controlValue}>{fontSize}</Text>
                    <TouchableOpacity 
                      style={styles.smallButton} 
                      onPress={() => adjustFontSize(2)}
                    >
                      <Plus size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Countdown Control */}
                <View style={styles.controlGroup}>
                  <Text style={styles.controlLabel}>Timer</Text>
                  <View style={styles.controlRow}>
                    <TouchableOpacity 
                      style={styles.smallButton} 
                      onPress={() => adjustCountdown(-1)}
                    >
                      <Minus size={14} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.controlValue}>{countdownTime}s</Text>
                    <TouchableOpacity 
                      style={styles.smallButton} 
                      onPress={() => adjustCountdown(1)}
                    >
                      <Plus size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Record Button */}
              <TouchableOpacity
                style={[styles.recordButton, isRecording && styles.recordingButton]}
                onPress={isRecording ? stopRecording : startCountdown}
                disabled={!currentScript}
              >
                {isRecording ? (
                  <Square size={28} color="#fff" />
                ) : (
                  <Play size={28} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.webFallbackContainer}>
          <View style={styles.webFallbackContent}>
            <Text style={styles.webFallbackTitle}>Funcionalidade de Câmera Não Disponível</Text>
            <Text style={styles.webFallbackText}>
              A gravação de vídeo com câmera só está disponível em dispositivos móveis (iOS/Android).
            </Text>
            <Text style={styles.webFallbackText}>
              Para testar esta funcionalidade, use o Expo Go no seu celular.
            </Text>
            {currentScript && (
              <View style={styles.scriptPreview}>
                <Text style={styles.scriptPreviewTitle}>Script Selecionado:</Text>
                <Text style={styles.scriptPreviewContent}>{currentScript.title}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {!currentScript && (
        <View style={styles.noScriptContainer}>
          <Text style={styles.noScriptText}>Nenhum script selecionado</Text>
          <Text style={styles.noScriptSubText}>
            Vá para a aba Scripts e toque em "Selecionar" em um script para começar
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#374151',
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 60,
  },
  bottomControls: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 350,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderRadius: 25,
  },
  controlGroup: {
    alignItems: 'center',
    minWidth: 80,
  },
  controlLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  smallButton: {
    padding: 6,
  },
  controlValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
  },
  recordButton: {
    backgroundColor: '#10B981',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  recordingButton: {
    backgroundColor: '#EF4444',
  },
  noScriptContainer: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
  },
  noScriptText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noScriptSubText: {
    color: '#d1d5db',
    fontSize: 14,
    textAlign: 'center',
  },
  webFallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  webFallbackContent: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  webFallbackTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  webFallbackText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  scriptPreview: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    width: '100%',
  },
  scriptPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  scriptPreviewContent: {
    fontSize: 16,
    color: '#1f2937',
  },
});