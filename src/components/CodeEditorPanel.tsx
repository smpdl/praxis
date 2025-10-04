import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorPanelProps {
    code: string;
    onCodeChange: (code: string) => void;
}

const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({ code, onCodeChange }) => {
    return (
        <div className="h-full w-full bg-gray-900">
            <Editor
                height="100%"
                language="javascript"
                theme="vs-dark"
                value={code}
                onChange={(value) => onCodeChange(value || '')}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditorPanel;
