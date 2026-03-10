'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import type { EditorState } from 'lexical';

import PlaygroundNodes from '../package/nodes/PlaygroundNodes';
import PlaygroundEditorTheme from '../package/themes/PlaygroundEditorTheme';
import ContentEditable from '../package/ui/ContentEditable';
import ToolbarPlugin from '../package/plugins/ToolbarPlugin';
import CodeHighlightPlugin from '../package/plugins/CodeHighlightPlugin';
import LinkPlugin from '../package/plugins/LinkPlugin';
import FloatingLinkEditorPlugin from '../package/plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from '../package/plugins/FloatingTextFormatToolbarPlugin';
import ImagesPlugin from '../package/plugins/ImagesPlugin';
import InlineImagePlugin from '../package/plugins/InlineImagePlugin';
import AutoLinkPlugin from '../package/plugins/AutoLinkPlugin';
import MarkdownShortcutPlugin from '../package/plugins/MarkdownShortcutPlugin';
import ComponentPickerPlugin from '../package/plugins/ComponentPickerPlugin';
import DragDropPaste from '../package/plugins/DragDropPastePlugin';
import EmojiPickerPlugin from '../package/plugins/EmojiPickerPlugin';
import EmojisPlugin from '../package/plugins/EmojisPlugin';
import EquationsPlugin from '../package/plugins/EquationsPlugin';
import CollapsiblePlugin from '../package/plugins/CollapsiblePlugin';
import PageBreakPlugin from '../package/plugins/PageBreakPlugin';
import { LayoutPlugin } from '../package/plugins/LayoutPlugin/LayoutPlugin';
import YouTubePlugin from '../package/plugins/YouTubePlugin';
import TwitterPlugin from '../package/plugins/TwitterPlugin';
import FigmaPlugin from '../package/plugins/FigmaPlugin';
import PollPlugin from '../package/plugins/PollPlugin';
import TableCellResizer from '../package/plugins/TableCellResizer';
import ExcalidrawPlugin from '../package/plugins/ExcalidrawPlugin';
import CodeLineNumbersPlugin from '../package/plugins/CodeLineNumbersPlugin';
import CodeActionMenuPlugin from '../package/plugins/CodeActionMenuPlugin';
import AutoEmbedPlugin from '../package/plugins/AutoEmbedPlugin';
import { TableContext } from '../package/plugins/TablePlugin';
import { ToolbarContext } from '../package/context/ToolbarContext';
import { SharedHistoryContext, useSharedHistoryContext } from '../package/context/SharedHistoryContext';

function SetInitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (content && !hasLoaded.current) {
      hasLoaded.current = true;
      setTimeout(() => {
        try {
          const editorState = editor.parseEditorState(content);
          editor.setEditorState(editorState);
        } catch (e) {
          console.error('Failed to load initial content:', e);
        }
      }, 0);
    }
  }, [editor, content]);

  return null;
}

function EditorInner({
  initialContent,
  onChange,
}: {
  initialContent: string;
  onChange: (content: string) => void;
}) {
  const { historyState } = useSharedHistoryContext();
  const [editor] = useLexicalComposerContext();

  const handleChange = useCallback(
    (editorState: EditorState) => {
      const json = JSON.stringify(editorState.toJSON());
      onChange(json);
    },
    [onChange]
  );

  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <>
      <ToolbarPlugin
        editor={editor}
        activeEditor={activeEditor}
        setActiveEditor={setActiveEditor}
        setIsLinkEditMode={setIsLinkEditMode}
      />
      <div className="editor-container">
        <DragDropPaste />
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <ComponentPickerPlugin />
        <EmojiPickerPlugin />
        <AutoEmbedPlugin />
        <EmojisPlugin />
        <HashtagPlugin />
        <AutoLinkPlugin />
        <HistoryPlugin externalHistoryState={historyState} />
        <RichTextPlugin
          contentEditable={
            <div className="editor-scroller">
              <div className="editor" ref={onRef}>
                <ContentEditable placeholder="Start writing your blog post..." />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <MarkdownShortcutPlugin />
        <CodeHighlightPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <TablePlugin hasCellMerge={true} hasCellBackgroundColor={true} />
        <TableCellResizer />
        <ImagesPlugin />
        <InlineImagePlugin />
        <LinkPlugin hasLinkAttributes={true} />
        <PollPlugin />
        <TwitterPlugin />
        <YouTubePlugin />
        <FigmaPlugin />
        <ClickableLinkPlugin disabled={true} />
        <HorizontalRulePlugin />
        <EquationsPlugin />
        <TabIndentationPlugin maxIndent={7} />
        <CollapsiblePlugin />
        <PageBreakPlugin />
        <LayoutPlugin />
        <ExcalidrawPlugin />
        <CodeLineNumbersPlugin />
        <OnChangePlugin onChange={handleChange} ignoreSelectionChange={true} />
        {initialContent && <SetInitialContentPlugin content={initialContent} />}
        {floatingAnchorElem && (
          <>
            <FloatingLinkEditorPlugin
              anchorElem={floatingAnchorElem}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
            <FloatingTextFormatToolbarPlugin
              anchorElem={floatingAnchorElem}
              setIsLinkEditMode={setIsLinkEditMode}
            />
            <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
          </>
        )}
      </div>
    </>
  );
}

export default function AdminEditor({
  initialContent,
  onChange,
}: {
  initialContent: string;
  onChange: (content: string) => void;
}) {
  const initialConfig = {
    namespace: 'CoreBlockAdmin',
    nodes: [...PlaygroundNodes],
    editable: true,
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
    theme: PlaygroundEditorTheme,
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-xl font-bold text-navy-900">Content Editor</h2>
        <p className="text-sm text-navy-500 mt-0.5">Use the rich text editor below to write your blog post</p>
      </div>
      <LexicalComposer initialConfig={initialConfig}>
        <SharedHistoryContext>
          <TableContext>
            <ToolbarContext>
              <div className="editor-shell">
                <EditorInner initialContent={initialContent} onChange={onChange} />
              </div>
            </ToolbarContext>
          </TableContext>
        </SharedHistoryContext>
      </LexicalComposer>
    </div>
  );
}
