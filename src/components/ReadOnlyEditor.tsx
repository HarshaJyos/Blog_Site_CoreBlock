'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import PlaygroundNodes from '../package/nodes/PlaygroundNodes';
import PlaygroundEditorTheme from '../package/themes/PlaygroundEditorTheme';

function SetContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (content) {
      setTimeout(() => {
        try {
          const editorState = editor.parseEditorState(content);
          editor.setEditorState(editorState);
        } catch (e) {
          console.error('Failed to parse editor state:', e);
        }
      }, 0);
    }
  }, [editor, content]);

  return null;
}

export default function ReadOnlyEditor({ content }: { content: string }) {
  const initialConfig = {
    namespace: 'CoreBlockReader',
    nodes: [...PlaygroundNodes],
    editable: false,
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
    theme: PlaygroundEditorTheme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="readonly-editor">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="outline-none min-h-[200px] blog-content"
              aria-label="Blog content"
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <CheckListPlugin />
        <TablePlugin hasCellMerge={true} hasCellBackgroundColor={true} />
        <HorizontalRulePlugin />
        <SetContentPlugin content={content} />
      </div>
    </LexicalComposer>
  );
}
