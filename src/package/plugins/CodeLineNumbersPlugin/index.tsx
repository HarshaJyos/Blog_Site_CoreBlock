/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isCodeNode, CodeNode } from '@lexical/code';
import { useEffect } from 'react';
import { $getNearestNodeFromDOMNode } from 'lexical';

export default function CodeLineNumbersPlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerMutationListener(CodeNode, (mutations) => {
            editor.update(() => {
                for (const [key, mutation] of mutations) {
                    if (mutation === 'created' || mutation === 'updated') {
                        const node = editor.getElementByKey(key);
                        if (node) {
                            const codeNode = $getNearestNodeFromDOMNode(node);
                            if ($isCodeNode(codeNode)) {
                                const content = codeNode.getTextContent();
                                const lineCount = content.split('\n').length;
                                let gutter = '';
                                for (let i = 1; i <= lineCount; i++) {
                                    gutter += i + '\n';
                                }
                                node.setAttribute('data-gutter', gutter);
                            }
                        }
                    }
                }
            });
        });
    }, [editor]);

    return null;
}
