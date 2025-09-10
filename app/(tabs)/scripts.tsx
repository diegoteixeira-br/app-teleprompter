import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, CreditCard as Edit3, Trash2, Play, Search } from 'lucide-react-native';
import { router } from 'expo-router';
import { useScript } from '@/context/ScriptContext';
import ScriptEditor from '@/components/ScriptEditor';

interface Script {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function ScriptsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const { scripts, loading, createScript, updateScript, deleteScript, setCurrentScript } = useScript();

  const filteredScripts = scripts.filter(script =>
    script.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    script.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewScript = () => {
    setEditingScript(null);
    setShowEditor(true);
  };

  const handleEditScript = (script: Script) => {
    setEditingScript(script);
    setShowEditor(true);
  };

  const handleDeleteScript = (script: Script) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o script "${script.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: () => deleteScript(script.id) 
        },
      ]
    );
  };

  const handleSaveScript = async (title: string, content: string) => {
    if (editingScript) {
      await updateScript(editingScript.id, title, content);
    } else {
      await createScript(title, content);
    }
    setShowEditor(false);
    setEditingScript(null);
  };

  const handleSelectScript = (script: Script) => {
    setCurrentScript(script);
    Alert.alert(
      'Script Selecionado',
      `"${script.title}" foi selecionado para gravação.`,
      [
        { text: 'OK' },
        { 
          text: 'Gravar Agora', 
          onPress: () => router.push('/(tabs)/')
        }
      ]
    );
  };

  const renderScriptItem = ({ item }: { item: Script }) => (
    <View style={styles.scriptItem}>
      <View style={styles.scriptHeader}>
        <Text style={styles.scriptTitle}>{item.title}</Text>
        <Text style={styles.scriptDate}>
          {new Date(item.updated_at).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      
      <Text style={styles.scriptPreview} numberOfLines={2}>
        {item.content}
      </Text>
      
      <View style={styles.scriptActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.selectButton]}
          onPress={() => handleSelectScript(item)}
        >
          <Play size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Selecionar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditScript(item)}
        >
          <Edit3 size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteScript(item)}
        >
          <Trash2 size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Scripts</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleNewScript}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar scripts..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando scripts...</Text>
        </View>
      ) : filteredScripts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'Nenhum script encontrado' : 'Nenhum script ainda'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery 
              ? 'Tente buscar com outros termos' 
              : 'Toque no botão + para criar seu primeiro script'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredScripts}
          keyExtractor={(item) => item.id}
          renderItem={renderScriptItem}
          contentContainerStyle={styles.scriptsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={showEditor}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ScriptEditor
          script={editingScript}
          onSave={handleSaveScript}
          onClose={() => {
            setShowEditor(false);
            setEditingScript(null);
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  scriptsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scriptItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  scriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scriptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  scriptDate: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 12,
  },
  scriptPreview: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  scriptActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  selectButton: {
    backgroundColor: '#10B981',
  },
  editButton: {
    backgroundColor: '#F59E0B',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});