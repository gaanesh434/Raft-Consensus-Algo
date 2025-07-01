import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface EditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  language?: string;
  theme?: 'light' | 'dark';
  onError?: (error: Error) => void;
}

interface EditorState {
  content: string;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const Editor: React.FC<EditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter your Raft commands here...',
  disabled = false,
  language = 'javascript',
  theme = 'dark',
  onError
}) => {
  const [state, setState] = useState<EditorState>({
    content: value,
    isLoading: true,
    error: null,
    isInitialized: false
  });

  // Safe state updater
  const updateState = useCallback((updates: Partial<EditorState>) => {
    setState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);

  // Initialize editor with error handling
  useEffect(() => {
    const initializeEditor = async () => {
      try {
        updateState({ isLoading: true, error: null });

        // Simulate async initialization (e.g., WebAssembly, Monaco Editor)
        await new Promise(resolve => setTimeout(resolve, 100));

        // Validate props
        if (typeof value !== 'string') {
          throw new Error('Editor value must be a string');
        }

        if (onChange && typeof onChange !== 'function') {
          throw new Error('Editor onChange must be a function');
        }

        updateState({
          content: value,
          isLoading: false,
          isInitialized: true
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        updateState({
          error: errorMessage,
          isLoading: false,
          isInitialized: false
        });

        if (onError && error instanceof Error) {
          onError(error);
        }
      }
    };

    initializeEditor();
  }, [value, onChange, onError, updateState]);

  // Handle content changes with validation
  const handleContentChange = useCallback((newContent: string) => {
    try {
      // Validate input
      if (typeof newContent !== 'string') {
        throw new Error('Content must be a string');
      }

      // Update internal state
      updateState({ content: newContent, error: null });

      // Call external onChange handler
      if (onChange) {
        onChange(newContent);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating content';
      updateState({ error: errorMessage });
      
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [onChange, onError, updateState]);

  // Handle textarea change events
  const handleTextareaChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const newValue = event.target.value;
      handleContentChange(newValue);
    } catch (error) {
      console.error('Error in textarea change handler:', error);
    }
  }, [handleContentChange]);

  // Test error injection (for development/testing)
  const injectTestError = useCallback(() => {
    throw new Error('Test error injected in Editor component');
  }, []);

  // Loading state
  if (state.isLoading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ marginBottom: '1rem' }}>⏳ Loading Editor...</div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Initializing editor components
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div style={{
        padding: '2rem',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fecaca',
        color: '#dc2626'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Editor Error</h3>
        <p style={{ marginBottom: '1rem' }}>{state.error}</p>
        <button
          onClick={() => updateState({ error: null, isLoading: true })}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Main editor UI
  return (
    <div style={{
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
    }}>
      {/* Editor Header */}
      <div style={{
        padding: '0.75rem 1rem',
        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
        borderBottom: '1px solid #d1d5db',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          color: theme === 'dark' ? '#f3f4f6' : '#374151'
        }}>
          Raft Command Editor ({language})
        </div>
        
        {/* Development: Test error button */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={injectTestError}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            title="Test Error Boundary"
          >
            Test Error
          </button>
        )}
      </div>

      {/* Editor Content */}
      <div style={{ position: 'relative' }}>
        <textarea
          value={state.content}
          onChange={handleTextareaChange}
          placeholder={placeholder}
          disabled={disabled || !state.isInitialized}
          style={{
            width: '100%',
            height: '200px',
            padding: '1rem',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#f3f4f6' : '#374151'
          }}
        />
        
        {/* Character count */}
        <div style={{
          position: 'absolute',
          bottom: '0.5rem',
          right: '0.5rem',
          fontSize: '0.75rem',
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px'
        }}>
          {state.content.length} characters
        </div>
      </div>
    </div>
  );
};

// Wrapped Editor with Error Boundary
const SafeEditor: React.FC<EditorProps> = (props) => {
  return (
    <ErrorBoundary
      fallback={
        <div style={{
          padding: '2rem',
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>
            Editor Component Error
          </h3>
          <p style={{ color: '#7f1d1d', marginBottom: '1rem' }}>
            The editor component encountered an error and couldn't render properly.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('Editor Error Boundary caught error:', error, errorInfo);
        if (props.onError) {
          props.onError(error);
        }
      }}
    >
      <Editor {...props} />
    </ErrorBoundary>
  );
};

export default SafeEditor;
export { Editor };