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
import { useEffect, useState } from 'react';
import PlaygroundNodes from '../package/nodes/PlaygroundNodes';
import PlaygroundEditorTheme from '../package/themes/PlaygroundEditorTheme';
import CodeActionMenuPlugin from '../package/plugins/CodeActionMenuPlugin';
import CodeHighlightPlugin from '../package/plugins/CodeHighlightPlugin';
import CodeLineNumbersPlugin from '../package/plugins/CodeLineNumbersPlugin';

export default function ReadOnlyEditor({ content }: { content: string }) {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };
  const initialConfig = {
    namespace: 'CoreBlockReader',
    nodes: [...PlaygroundNodes],
    editable: false,
    editorState: content || undefined,
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
    theme: PlaygroundEditorTheme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="readonly-editor relative">
        <RichTextPlugin
          contentEditable={
            <div className="editor-scroller">
              <div className="editor" ref={onRef}>
                <ContentEditable
                  className="outline-none min-h-[200px] blog-content"
                  aria-label="Blog content"
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <CheckListPlugin />
        <TablePlugin hasCellMerge={true} hasCellBackgroundColor={true} />
        <HorizontalRulePlugin />
        <CodeHighlightPlugin />
        <CodeLineNumbersPlugin />

        {floatingAnchorElem && (
          <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
        )}
      </div>
    </LexicalComposer>
  );
}
