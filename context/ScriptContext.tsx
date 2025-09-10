import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Script {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface ScriptContextType {
  scripts: Script[];
  currentScript: Script | null;
  loading: boolean;
  createScript: (title: string, content: string) => Promise<void>;
  updateScript: (id: string, title: string, content: string) => Promise<void>;
  deleteScript: (id: string) => Promise<void>;
  setCurrentScript: (script: Script | null) => void;
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

// Mock data for demonstration
const mockScripts: Script[] = [
  {
    id: '1',
    title: 'Apresentação do Canal',
    content: `Olá pessoal, sejam muito bem-vindos ao meu canal!

Meu nome é João e hoje vamos falar sobre um assunto muito interessante.

**Este é um exemplo de texto em negrito** para destacar informações importantes.

*E este é um exemplo de texto em itálico* para dar ênfase especial.

Lembrem-se de se inscrever no canal e ativar o sininho das notificações para não perderem nenhum conteúdo novo.

Vamos começar!`,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Tutorial de Culinária',
    content: `Bem-vindos à nossa cozinha!

Hoje vamos preparar uma receita muito especial e fácil de fazer.

**Ingredientes necessários:**
- 2 ovos
- 1 xícara de farinha
- 1/2 xícara de leite
- 1 colher de açúcar

*Modo de preparo:*

Primeiro, vamos quebrar os ovos em uma tigela grande.

Em seguida, adicione a farinha e misture bem até formar uma massa homogênea.

Aos poucos, vá adicionando o leite e continue mexendo.

Por último, adicione o açúcar e misture delicadamente.

A massa está pronta para ir à frigideira!

Não se esqueçam de compartilhar o resultado nos comentários!`,
    created_at: '2024-01-16T14:30:00Z',
    updated_at: '2024-01-16T14:30:00Z',
  }
];

export function ScriptProvider({ children }: { children: ReactNode }) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [currentScript, setCurrentScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load mock data - replace with Supabase data loading
    setScripts(mockScripts);
    setCurrentScript(mockScripts[0]); // Set first script as default
  }, []);

  const createScript = async (title: string, content: string): Promise<void> => {
    setLoading(true);
    try {
      const newScript: Script = {
        id: Date.now().toString(),
        title,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setScripts(prev => [newScript, ...prev]);
      
      // TODO: Replace with Supabase insert
      // const { data, error } = await supabase
      //   .from('scripts')
      //   .insert([{ title, content }]);
      
    } catch (error) {
      console.error('Error creating script:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateScript = async (id: string, title: string, content: string): Promise<void> => {
    setLoading(true);
    try {
      const updatedScript = {
        id,
        title,
        content,
        created_at: scripts.find(s => s.id === id)?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setScripts(prev => prev.map(script => 
        script.id === id ? updatedScript : script
      ));
      
      if (currentScript?.id === id) {
        setCurrentScript(updatedScript);
      }
      
      // TODO: Replace with Supabase update
      // const { data, error } = await supabase
      //   .from('scripts')
      //   .update({ title, content })
      //   .eq('id', id);
      
    } catch (error) {
      console.error('Error updating script:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteScript = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      setScripts(prev => prev.filter(script => script.id !== id));
      
      if (currentScript?.id === id) {
        const remainingScripts = scripts.filter(s => s.id !== id);
        setCurrentScript(remainingScripts.length > 0 ? remainingScripts[0] : null);
      }
      
      // TODO: Replace with Supabase delete
      // const { error } = await supabase
      //   .from('scripts')
      //   .delete()
      //   .eq('id', id);
      
    } catch (error) {
      console.error('Error deleting script:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScriptContext.Provider value={{
      scripts,
      currentScript,
      loading,
      createScript,
      updateScript,
      deleteScript,
      setCurrentScript,
    }}>
      {children}
    </ScriptContext.Provider>
  );
}

export function useScript() {
  const context = useContext(ScriptContext);
  if (context === undefined) {
    throw new Error('useScript must be used within a ScriptProvider');
  }
  return context;
}