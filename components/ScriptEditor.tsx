import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Save, Type, Bold, Italic } from 'lucide-react-native';

interface Script {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface ScriptEditorProps {
  script: Script | null;
  onSave: (title: string, content: string) => void;
  onClose: () => void;
}

export default function ScriptEditor({ script, onSave, onClose }: ScriptEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState(0);

  useEffect(() => {
    if (script) {
      setTitle(script.title);
      setContent(script.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [script]);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    const count = words.length;
    setWordCount(count);
    
    // Estimate duration based on average speaking speed of 150 words per minute
    const duration = Math.ceil(count / 150);
    setEstimatedDuration(duration);
  }, [content]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Por favor, digite um título para o script.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Erro', 'Por favor, digite o conteúdo do script.');
      return;
    }

    onSave(title.trim(), content.trim());
  };

  const handleClose = () => {
    if ((title.trim() || content.trim()) && (!script || title !== script.title || content !== script.content)) {
      Alert.alert(
        'Descartar Alterações',
        'Você tem alterações não salvas. Deseja descartá-las?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: () => onClose() },
        ]
      );
    } else {
      onClose();
    }
  };

  const insertFormatting = (formatType: 'bold' | 'italic') => {
    // Simple formatting - could be enhanced with selection handling
    const formatChar = formatType === 'bold' ? '**' : '*';
    const placeholder = formatType === 'bold' ? 'texto em negrito' : 'texto em itálico';
    const newText = `${content}\n${formatChar}${placeholder}${formatChar}`;
    setContent(newText);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
            <X size={24} color="#374151" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {script ? 'Editar Script' : 'Novo Script'}
          </Text>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Digite o título do script..."
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Formatting Tools */}
          <View style={styles.formattingTools}>
            <Text style={styles.label}>Formatação</Text>
            <View style={styles.toolsRow}>
              <TouchableOpacity 
                style={styles.toolButton}
                onPress={() => insertFormatting('bold')}
              >
                <Bold size={18} color="#374151" />
                <Text style={styles.toolButtonText}>Negrito</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.toolButton}
                onPress={() => insertFormatting('italic')}
              >
                <Italic size={18} color="#374151" />
                <Text style={styles.toolButtonText}>Itálico</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Conteúdo</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Digite o conteúdo do script aqui...

Dicas:
- Use **texto** para negrito
- Use *texto* para itálico
- Separe parágrafos com linhas em branco para melhor legibilidade"
              placeholderTextColor="#9ca3af"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Statistics */}
          <View style={styles.statistics}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{wordCount}</Text>
              <Text style={styles.statLabel}>Palavras</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{estimatedDuration}</Text>
              <Text style={styles.statLabel}>Min (estimado)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{content.length}</Text>
              <Text style={styles.statLabel}>Caracteres</Text>
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Dicas para um bom script</Text>
            <Text style={styles.tipText}>• Escreva frases claras e diretas</Text>
            <Text style={styles.tipText}>• Use pausas naturais entre parágrafos</Text>
            <Text style={styles.tipText}>• Pratique a leitura antes de gravar</Text>
            <Text style={styles.tipText}>• Mantenha um tom conversacional</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  inputGroup: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  formattingTools: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  toolButtonText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 4,
  },
  contentInput: {
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    minHeight: 200,
    lineHeight: 24,
  },
  statistics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  tipsContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 4,
    lineHeight: 20,
  },
});