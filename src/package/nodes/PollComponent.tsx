import type { Option, Options, PollNode } from './PollNode';
import type { JSX } from 'react';

import './PollNode.css';

import { useAuth } from '@/components/AuthContext';
import { LoginModal } from '@/components/LoginModal';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, collection, serverTimestamp } from 'firebase/firestore';

import { useCollaborationContext } from '@lexical/react/LexicalCollaborationContext';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  BaseSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  NodeKey,
} from 'lexical';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Button from '../ui/Button';
import joinClasses from '../utils/joinClasses';
import { $isPollNode, createPollOption } from './PollNode';

function getTotalVotes(options: Options): number {
  return options.reduce((totalVotes, next) => {
    return totalVotes + next.votes.length;
  }, 0);
}

function PollOptionComponent({
  option,
  index,
  options,
  totalVotes,
  withPollNode,
  editable,
  onVote,
  votedUid,
  serverVotes,
  isSubmitting,
}: {
  index: number;
  option: Option;
  options: Options;
  totalVotes: number;
  withPollNode: (
    cb: (pollNode: PollNode) => void,
    onSelect?: () => void,
  ) => void;
  editable: boolean;
  onVote: (uid: string) => void;
  votedUid: string | null;
  serverVotes: number;
  isSubmitting: boolean;
}): JSX.Element {
  const { clientID } = useCollaborationContext();
  const checkboxRef = useRef(null);
  const votesArray = option.votes;
  const checkedIndex = votesArray.indexOf(clientID);
  const checked = checkedIndex !== -1 || votedUid === option.uid;
  const votes = serverVotes || votesArray.length;
  const text = option.text;

  return (
    <div className="PollNode__optionContainer">
      <div
        className={joinClasses(
          'PollNode__optionCheckboxWrapper',
          checked && 'PollNode__optionCheckboxChecked',
        )}>
        <input
          ref={checkboxRef}
          className="PollNode__optionCheckbox"
          type="checkbox"
          disabled={!editable && (votedUid !== null || isSubmitting)}
          onChange={(e) => {
            if (editable) {
              withPollNode((node) => {
                node.toggleVote(option, clientID);
              });
            } else {
              onVote(option.uid);
            }
          }}
          checked={checked}
        />
      </div>
      <div className="PollNode__optionInputWrapper">
        <div
          className="PollNode__optionInputVotes"
          style={{ width: `${votes === 0 ? 0 : (votes / totalVotes) * 100}%` }}
        />
        <span className="PollNode__optionInputVotesCount">
          {votes > 0 && (votes === 1 ? '1 vote' : `${votes} votes`)}
        </span>
        <input
          className="PollNode__optionInput"
          type="text"
          readOnly={!editable}
          value={text}
          onChange={(e) => {
            if (!editable) return;
            const target = e.target;
            const value = target.value;
            const selectionStart = target.selectionStart;
            const selectionEnd = target.selectionEnd;
            withPollNode(
              (node) => {
                node.setOptionText(option, value);
              },
              () => {
                target.selectionStart = selectionStart;
                target.selectionEnd = selectionEnd;
              },
            );
          }}
          placeholder={`Option ${index + 1}`}
        />
      </div>
      {editable && (
        <button
          disabled={options.length < 3}
          className={joinClasses(
            'PollNode__optionDelete',
            options.length < 3 && 'PollNode__optionDeleteDisabled',
          )}
          aria-label="Remove"
          onClick={() => {
            withPollNode((node) => {
              node.deleteOption(option);
            });
          }}
        />
      )}
    </div>
  );
}

export default function PollComponent({
  question,
  options,
  pollId,
  createdAt,
  nodeKey,
}: {
  createdAt: number;
  nodeKey: NodeKey;
  options: Options;
  pollId: string;
  question: string;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const editable = editor.isEditable();

  const [pollResults, setPollResults] = useState<{
    totalVotes: number;
    options: Record<string, number>;
  } | null>(null);

  const [votedUid, setVotedUid] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load results and user vote status
  useEffect(() => {
    // Check expiration
    const now = Date.now();
    if (now - createdAt > 24 * 60 * 60 * 1000) {
      setIsExpired(true);
    }

    // Fetch live results
    if (!editable) {
      const fetchPollData = async () => {
        try {
          const docRef = doc(db, 'polls', pollId);
          const docSnap = await getDoc(docRef);
          
          let userVotedOption = null;
          if (user && docSnap.exists()) {
              const voteDocRef = doc(collection(db, 'polls', pollId, 'votes'), user.uid);
              const voteSnap = await getDoc(voteDocRef);
              if (voteSnap.exists()) {
                  userVotedOption = voteSnap.data().optionUid;
              }
          }

          if (docSnap.exists()) {
              setPollResults({
                  totalVotes: docSnap.data().totalVotes,
                  options: docSnap.data().options || {}
              });
              setVotedUid(userVotedOption);
          } else {
              setPollResults({ totalVotes: 0, options: {} });
              setVotedUid(null);
          }
        } catch (err) {
          console.error('Failed to fetch poll results:', err);
        }
      };
      fetchPollData();
    }
  }, [pollId, editable, createdAt, user]);

  const totalVotes = useMemo(() => {
    if (pollResults) return pollResults.totalVotes;
    return getTotalVotes(options);
  }, [options, pollResults]);

  const handleVote = async (optionUid: string) => {
    if (votedUid || isExpired || isSubmitting) return;

    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const pollRef = doc(db, 'polls', pollId);
      const pollSnap = await getDoc(pollRef);
      
      const voteDocRef = doc(collection(db, 'polls', pollId, 'votes'), user.uid);
      const voteSnap = await getDoc(voteDocRef);

      if (voteSnap.exists()) {
        setVotedUid(voteSnap.data().optionUid);
        return;
      }

      if (!pollSnap.exists()) {
         await setDoc(pollRef, {
             totalVotes: 1,
             options: { [optionUid]: 1 },
             createdAt: createdAt || Date.now(),
             lastVoteAt: serverTimestamp(),
         });
      } else {
         await updateDoc(pollRef, {
             totalVotes: increment(1),
             [`options.${optionUid}`]: increment(1),
             lastVoteAt: serverTimestamp(),
         });
      }

      await setDoc(voteDocRef, {
          optionUid,
          userId: user.uid,
          pollId: pollId,
          timestamp: serverTimestamp(),
      });

      const updatedSnap = await getDoc(pollRef);
      if (updatedSnap.exists()) {
        setPollResults({
          totalVotes: updatedSnap.data().totalVotes,
          options: updatedSnap.data().options || {}
        });
      }
      setVotedUid(optionUid);
      
    } catch (err) {
      console.error('Failed to submit vote:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [selection, setSelection] = useState<BaseSelection | null>(null);
  const ref = useRef(null);

  const $onDelete = useCallback(
    (payload: KeyboardEvent) => {
      const deleteSelection = $getSelection();
      if (isSelected && $isNodeSelection(deleteSelection)) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        deleteSelection.getNodes().forEach((node) => {
          if ($isPollNode(node)) {
            node.remove();
          }
        });
      }
      return false;
    },
    [isSelected],
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        setSelection(editorState.read(() => $getSelection()));
      }),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (payload) => {
          const event = payload;

          if (event.target === ref.current) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [clearSelection, editor, isSelected, nodeKey, $onDelete, setSelected]);

  const withPollNode = (
    cb: (node: PollNode) => void,
    onUpdate?: () => void,
  ): void => {
    editor.update(
      () => {
        const node = $getNodeByKey(nodeKey);
        if ($isPollNode(node)) {
          cb(node);
        }
      },
      { onUpdate },
    );
  };

  const addOption = () => {
    withPollNode((node) => {
      node.addOption(createPollOption());
    });
  };

  const isFocused = $isNodeSelection(selection) && isSelected;

  return (
    <div
      className={`PollNode__container ${isFocused ? 'focused' : ''}`}
      ref={ref}>
      <div className="PollNode__inner">
        <div className="flex justify-between items-center mb-4">
          <h2 className="PollNode__heading">{question}</h2>
          {isExpired && (
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider px-2 py-1 bg-red-50 rounded">
              Closed
            </span>
          )}
        </div>
        {options.map((option, index) => {
          const key = option.uid;
          return (
            <PollOptionComponent
              key={key}
              withPollNode={withPollNode}
              option={option}
              index={index}
              options={options}
              totalVotes={totalVotes}
              editable={editable}
              onVote={handleVote}
              votedUid={votedUid}
              serverVotes={pollResults?.options[option.uid] || 0}
              isSubmitting={isSubmitting}
            />
          );
        })}
        <div className="PollNode__footer">
          {editable ? (
            <Button onClick={addOption} small={true}>
              Add Option
            </Button>
          ) : (
            <div className="text-xs text-zinc-500 italic">
              {totalVotes} total votes • {isExpired ? 'Poll ended' : 'Voting ends after 24 hours'}
            </div>
          )}
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} title="Sign in to Vote" subtitle="Join the CoreBlock community to participate in community polls." />
    </div>
  );
}
