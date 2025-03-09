import { useCallback, useRef, useEffect } from 'react';
import { Block, BlockHandlers } from '../types';
import { BLOCK_TYPES } from '../constants/editorConstants';
import { detectFormat, getNextBlockType, updateBlockNumbers } from '../utils/blockUtils';

export const useBlockHandlers = (
  state: {
    blocks: Block[];
    activeBlock: string | null;
    textContent: Record<string, string>;
    selectedBlocks: Set<string>;
  },
  blockRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>,
  addToHistory: (blocks: Block[]) => void,
  updateBlocks: (blocks: Block[]) => void,
  setSelectedBlocks: (blocks: Set<string>) => void,
): BlockHandlers => {
  const lastKeyPressTime = useRef<number>(0);
  const lastClickedBlock = useRef<string | null>(null);
  const isDragging = useRef(false);
  const dragStartBlock = useRef<string | null>(null);
  const dragEndBlock = useRef<string | null>(null);
  const isTextSelection = useRef(false);
  const selectionStartBlock = useRef<string | null>(null);
  const selectionStartOffset = useRef<number>(0);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const multiBlockSelection = useRef<{
    startBlock: string | null;
    startOffset: number;
    endBlock: string | null;
    endOffset: number;
    selectedText: string;
  }>({
    startBlock: null,
    startOffset: 0,
    endBlock: null,
    endOffset: 0,
    selectedText: ''
  });

  // Find Block ID from a DOM node
  const findBlockIdFromNode = (node: Node | null): string | null => {
    if (!node) return null;
    
    let current = node;
    while (current && !(current instanceof HTMLElement && current.hasAttribute('data-block-id'))) {
      if (current.parentElement) {
        current = current.parentElement;
      } else {
        return null;
      }
    }
    
    return current instanceof HTMLElement ? current.getAttribute('data-block-id') : null;
  };

  const handleEnterKey = useCallback((blockId: string, element: HTMLDivElement): string => {
    const selection = window.getSelection();
    if (!selection) return blockId;

    const range = selection.getRangeAt(0);
    const currentBlock = state.blocks.find((b) => b.id === blockId);
    if (!currentBlock) return blockId;

    const content = element.textContent || '';
    const caretPos = range.startOffset;
    const textBefore = content.substring(0, caretPos);
    const textAfter = content.substring(caretPos);

    const now = Date.now();
    const isDoubleEnter = now - lastKeyPressTime.current < 500 && 
                         currentBlock.type === 'dialogue' && 
                         textBefore.trim() === '';
    lastKeyPressTime.current = now;

    addToHistory(state.blocks);

    // Special handling for transition blocks
    if (currentBlock.type === 'transition') {
      const currentIndex = state.blocks.findIndex((b) => b.id === blockId);
      const updatedBlocks = [...state.blocks];

      // Update current transition block
      updatedBlocks[currentIndex] = {
        ...currentBlock,
        content: textBefore.trim(),
      };

      // Create new scene heading block
      const newBlock = {
        id: Date.now().toString(),
        type: 'scene-heading',
        content: textAfter.trim(),
      };

      updatedBlocks.splice(currentIndex + 1, 0, newBlock);
      updateBlocks(updatedBlocks);

      // Focus the new scene heading block and show suggestions
      setTimeout(() => {
        const el = blockRefs.current[newBlock.id];
        if (el) {
          el.focus();
          const range = document.createRange();
          const textNode = el.firstChild || el;
          range.setStart(textNode, 0);
          range.collapse(true);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }

          // Trigger a focus event to show suggestions
          el.dispatchEvent(new FocusEvent('focus'));
        }
      }, 0);

      return newBlock.id;
    }

    if (isDoubleEnter) {
      const updatedBlocks = state.blocks.filter(b => b.id !== blockId);
      const newBlock = {
        id: Date.now().toString(),
        type: 'action',
        content: textAfter,
      };
      updatedBlocks.push(newBlock);
      updateBlocks(updatedBlocks);
      
      setTimeout(() => {
        const el = blockRefs.current[newBlock.id];
        if (el) {
          el.focus();
          const range = document.createRange();
          const textNode = el.firstChild || el;
          range.setStart(textNode, 0);
          range.collapse(true);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }, 0);
      
      return newBlock.id;
    }

    // Special handling for parenthetical blocks
    if (currentBlock.type === 'parenthetical') {
      const updatedBlocks = [...state.blocks];
      const currentIndex = state.blocks.findIndex((b) => b.id === blockId);

      // Keep the closing parenthesis with the current block
      const hasClosingParen = textBefore.includes(')');
      const cleanTextBefore = textBefore.replace(/\)/g, '').trim();
      
      // Update current parenthetical block
      updatedBlocks[currentIndex] = {
        ...currentBlock,
        content: hasClosingParen ? textBefore : `${cleanTextBefore})`
      };

      // Create new dialogue block
      const newBlock = {
        id: Date.now().toString(),
        type: 'dialogue',
        content: textAfter.replace(/^\)/, '').trim()
      };

      updatedBlocks.splice(currentIndex + 1, 0, newBlock);
      updateBlocks(updatedBlocks);

      setTimeout(() => {
        const el = blockRefs.current[newBlock.id];
        if (el) {
          el.focus();
          const range = document.createRange();
          const textNode = el.firstChild || el;
          range.setStart(textNode, 0);
          range.collapse(true);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }, 0);

      return newBlock.id;
    }

    const newBlockType = getNextBlockType(currentBlock.type, textBefore, false);
    const currentIndex = state.blocks.findIndex((b) => b.id === blockId);
    const updatedBlocks = [...state.blocks];

    updatedBlocks[currentIndex] = {
      ...currentBlock,
      content: textBefore,
    };

    const newBlock = {
      id: Date.now().toString(),
      type: newBlockType,
      content: textAfter,
    };

    updatedBlocks.splice(currentIndex + 1, 0, newBlock);
    updateBlocks(updatedBlocks);

    setTimeout(() => {
      const el = blockRefs.current[newBlock.id];
      if (el) {
        el.focus();
        const range = document.createRange();
        const textNode = el.firstChild || el;
        range.setStart(textNode, 0);
        range.collapse(true);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }, 0);

    return newBlock.id;
  }, [state.blocks, addToHistory, updateBlocks]);

  const handleFormatChange = useCallback((type: string) => {
    if (state.activeBlock) {
      addToHistory(state.blocks);
      const currentBlock = state.blocks.find((b) => b.id === state.activeBlock);
      if (!currentBlock) return;

      // Save current selection and cursor position
      const selection = window.getSelection();
      const activeElement = blockRefs.current[state.activeBlock];
      let cursorPosition = 0;
      let hasSelection = false;
      let selectionStart = 0;
      let selectionEnd = 0;

      if (selection && selection.rangeCount > 0 && activeElement) {
        const range = selection.getRangeAt(0);
        if (range.startContainer.parentNode === activeElement || range.startContainer === activeElement) {
          cursorPosition = range.startOffset;
          hasSelection = !range.collapsed;
          selectionStart = range.startOffset;
          selectionEnd = range.endOffset;
        }
      }

      // Format-specific content transformations
      let newContent = currentBlock.content;
      
      // If changing to parenthetical and current content is empty or just parentheses
      if (type === 'parenthetical') {
        const content = currentBlock.content.trim();
        if (content === '' || content === '()') {
          newContent = '()';
        } else if (!content.startsWith('(') || !content.endsWith(')')) {
          // Add parentheses if they don't exist
          newContent = `(${content.replace(/^\(|\)$/g, '')})`;
        }
      } else if (currentBlock.type === 'parenthetical' && type !== 'parenthetical') {
        // If changing from parenthetical to another type, remove parentheses
        newContent = currentBlock.content.replace(/^\(|\)$/g, '').trim();
      }

      // If changing to character, uppercase the content
      if (type === 'character' && currentBlock.type !== 'character') {
        newContent = newContent.toUpperCase();
      }

      // If changing to scene-heading, check if it needs a prefix
      if (type === 'scene-heading' && !(/^(INT|EXT|INT\/EXT|I\/E)\.?\s/i.test(newContent))) {
        // If empty or doesn't start with a scene prefix, we'll show suggestions later
        if (newContent.trim() === '') {
          newContent = '';
        }
      }

      // If changing to transition, check if it needs formatting
      if (type === 'transition' && !(/TO:$/.test(newContent) || /^FADE (IN|OUT)|^DISSOLVE/i.test(newContent))) {
        if (newContent.trim() === '') {
          newContent = '';
        } else if (!newContent.endsWith('TO:')) {
          newContent = newContent.toUpperCase();
        }
      }

      // Update the block with new type and transformed content
      const updatedBlocks = state.blocks.map((block) => {
        if (block.id === state.activeBlock) {
          return {
            ...block,
            type,
            content: newContent
          };
        }
        return block;
      });

      updateBlocks(updateBlockNumbers(updatedBlocks));

      // Restore cursor position or selection after the update
      setTimeout(() => {
        const el = blockRefs.current[state.activeBlock];
        if (!el) return;

        el.focus();

        // Handle special cases for empty blocks or blocks that need suggestions
        if ((type === 'scene-heading' || type === 'transition' || type === 'shot') && newContent.trim() === '') {
          // Trigger suggestions by dispatching a focus event
          el.dispatchEvent(new FocusEvent('focus'));
          return;
        }

        // Handle special case for parenthetical
        if (type === 'parenthetical' && newContent === '()') {
          const range = document.createRange();
          if (el.firstChild) {
            range.setStart(el.firstChild, 1);
            range.setEnd(el.firstChild, 1);
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
            }
            return;
          }
        }

        try {
          // Restore cursor position or selection
          const range = document.createRange();
          const textNode = el.firstChild || el;
          
          if (hasSelection) {
            // Adjust selection positions if content length changed
            const contentLengthRatio = newContent.length / currentBlock.content.length;
            const adjustedStart = Math.min(Math.round(selectionStart * contentLengthRatio), newContent.length);
            const adjustedEnd = Math.min(Math.round(selectionEnd * contentLengthRatio), newContent.length);
            
            range.setStart(textNode, adjustedStart);
            range.setEnd(textNode, adjustedEnd);
          } else {
            // Adjust cursor position if content length changed
            const adjustedPosition = Math.min(cursorPosition, newContent.length);
            range.setStart(textNode, adjustedPosition);
            range.collapse(true);
          }
          
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } catch (err) {
          // Fallback: place cursor at the end
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }, 0);
    }
  }, [state.activeBlock, state.blocks, addToHistory, updateBlocks]);

  const handleContentChange = useCallback((id: string, newContent: string, forcedType?: string) => {
    const currentBlockIndex = state.blocks.findIndex(b => b.id === id);
    const currentBlock = state.blocks[currentBlockIndex];
    
    if (!currentBlock) return;

    if (newContent.trim() === '') {
      addToHistory(state.blocks);
      const updatedBlocks = state.blocks.filter((_, index) => index !== currentBlockIndex);
      updateBlocks(updatedBlocks);
      return;
    }

    addToHistory(state.blocks);
    let updatedBlocks = [...state.blocks];

    // Function to create and focus a new scene heading block
    const createAndFocusSceneHeading = (afterIndex: number) => {
      const newBlock = {
        id: Date.now().toString(),
        type: 'scene-heading',
        content: '',
      };
      
      // Insert the new block after the specified index
      updatedBlocks.splice(afterIndex + 1, 0, newBlock);
      updateBlocks(updatedBlocks);

      // Focus the new scene heading block
      setTimeout(() => {
        const el = blockRefs.current[newBlock.id];
        if (el) {
          el.focus();
          const range = document.createRange();
          const textNode = el.firstChild || el;
          range.setStart(textNode, 0);
          range.collapse(true);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }, 0);

      return newBlock.id;
    };

    // Handle forced type changes (from suggestions)
    if (forcedType) {
      updatedBlocks = updatedBlocks.map(block => {
        if (block.id !== id) return block;
        return {
          ...block,
          type: forcedType,
          content: newContent,
        };
      });

      // If it's a transition, immediately create a new scene heading
      if (forcedType === 'transition') {
        createAndFocusSceneHeading(currentBlockIndex);
      }

      updateBlocks(updatedBlocks);
      return;
    }

    // Handle regular content changes
    const isTransitionContent = (content: string) => {
      const trimmedContent = content.trim().toUpperCase();
      return trimmedContent.endsWith('TO:') || 
             /^FADE (IN|OUT)|^DISSOLVE/.test(trimmedContent);
    };

    // Update the current block
    updatedBlocks = updatedBlocks.map(block => {
      if (block.id !== id) return block;

      // Special handling for parenthetical blocks
      if (block.type === 'parenthetical') {
        let content = newContent.trim();
        if (!content.startsWith('(')) content = `(${content}`;
        if (!content.endsWith(')')) content = `${content})`;
        return { ...block, content };
      }

      // Check for transition patterns
      if (isTransitionContent(newContent) && block.type !== 'transition') {
        return {
          ...block,
          type: 'transition',
          content: newContent.trim().toUpperCase(),
        };
      }

      const detectedFormat = detectFormat(newContent);
      return {
        ...block,
        content: newContent,
        type: detectedFormat || block.type,
      };
    });

    // Check if we just created a transition block
    const updatedBlock = updatedBlocks[currentBlockIndex];
    const wasTransitionCreated = updatedBlock.type === 'transition' && 
                                currentBlock.type !== 'transition';

    // If we just created a transition block, immediately create a scene heading
    if (wasTransitionCreated) {
      createAndFocusSceneHeading(currentBlockIndex);
    }

    updateBlocks(updatedBlocks);
  }, [state.blocks, addToHistory, updateBlocks]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, blockId: string) => {
    const el = e.target as HTMLDivElement;

    // Handle keyboard shortcuts
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      // Copy: Ctrl+C
      if (e.key === 'c') {
        // Check if we have a multi-block selection
        if (multiBlockSelection.current.startBlock && 
            multiBlockSelection.current.endBlock && 
            multiBlockSelection.current.startBlock !== multiBlockSelection.current.endBlock &&
            multiBlockSelection.current.selectedText) {
          e.preventDefault();
          handleCopyMultiBlockSelection();
        }
        return;
      }
      
      // Cut: Ctrl+X
      if (e.key === 'x') {
        // Check if we have a multi-block selection
        if (multiBlockSelection.current.startBlock && 
            multiBlockSelection.current.endBlock && 
            multiBlockSelection.current.startBlock !== multiBlockSelection.current.endBlock &&
            multiBlockSelection.current.selectedText) {
          e.preventDefault();
          handleCutMultiBlockSelection();
        }
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (el.textContent?.trim() !== '' || el.textContent === '') {
        handleEnterKey(blockId, el);
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const currentBlock = state.blocks.find((b) => b.id === blockId);
      if (!currentBlock) return;

      const currentIndex = BLOCK_TYPES.indexOf(currentBlock.type as any);
      const nextType = BLOCK_TYPES[(currentIndex + 1) % BLOCK_TYPES.length];

      handleFormatChange(nextType);
    }

    if (e.key === 'Backspace' && el.textContent === '') {
      e.preventDefault();
      e.stopPropagation();

      const currentIndex = state.blocks.findIndex((b) => b.id === blockId);
      if (currentIndex > 0) {
        addToHistory(state.blocks);
        
        const previousBlock = state.blocks[currentIndex - 1];
        const prevEl = blockRefs.current[previousBlock.id];

        const updatedBlocks = state.blocks.filter((b) => b.id !== blockId);
        updateBlocks(updatedBlocks);

        if (prevEl) {
          prevEl.focus();
          const range = document.createRange();
          
          if (!prevEl.firstChild) {
            prevEl.textContent = '';
          }
          
          const textNode = prevEl.firstChild || prevEl;
          const position = previousBlock.content.length;
          
          try {
            range.setStart(textNode, position);
            range.setEnd(textNode, position);
            
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } catch (err) {
            range.selectNodeContents(prevEl);
            range.collapse(false);
            
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        }
      }
    }
  }, [state.blocks, handleEnterKey, handleFormatChange, addToHistory, updateBlocks]);

  // Handle copy for multi-block selection
  const handleCopyMultiBlockSelection = useCallback(() => {
    if (!multiBlockSelection.current.startBlock || 
        !multiBlockSelection.current.endBlock || 
        !multiBlockSelection.current.selectedText) {
      return;
    }

    // Get the selected text with proper formatting
    const selectedText = multiBlockSelection.current.selectedText;
    
    // Create a structured representation for clipboard
    const formattedText = selectedText;
    
    // Copy to clipboard
    navigator.clipboard.writeText(formattedText).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }, []);

  // Handle cut for multi-block selection
  const handleCutMultiBlockSelection = useCallback(() => {
    if (!multiBlockSelection.current.startBlock || 
        !multiBlockSelection.current.endBlock || 
        !multiBlockSelection.current.selectedText) {
      return;
    }

    // First copy the selection
    handleCopyMultiBlockSelection();
    
    // Then delete the selection
    addToHistory(state.blocks);
    
    // Find the indices of the start and end blocks
    const startIdx = state.blocks.findIndex(b => b.id === multiBlockSelection.current.startBlock);
    const endIdx = state.blocks.findIndex(b => b.id === multiBlockSelection.current.endBlock);
    
    if (startIdx === -1 || endIdx === -1) return;
    
    // Get the selection range
    const selection = window.getSelection();
    if (!selection) return;
    
    // Let the browser handle the deletion for now
    // For more complex multi-block selections, we would need more sophisticated handling
    
    // Clear the selection state
    multiBlockSelection.current = {
      startBlock: null,
      startOffset: 0,
      endBlock: null,
      endOffset: 0,
      selectedText: ''
    };
  }, [addToHistory, handleCopyMultiBlockSelection]);

  const handleBlockClick = useCallback((id: string, e: React.MouseEvent) => {
    // If we're in the middle of a text selection, don't handle clicks
    if (isTextSelection.current) return;

    // Single click now only sets the active block but doesn't select it
    if (!isDragging.current) {
      // Only update the active block, don't select it
      lastClickedBlock.current = id;
    }
  }, []);

  const handleBlockDoubleClick = useCallback((id: string, e: React.MouseEvent) => {
    // Double-click selects the block
    if (e.shiftKey && lastClickedBlock.current) {
      const startIdx = state.blocks.findIndex(b => b.id === lastClickedBlock.current);
      const endIdx = state.blocks.findIndex(b => b.id === id);
      const [start, end] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
      
      const newSelection = new Set<string>();
      for (let i = start; i <= end; i++) {
        newSelection.add(state.blocks[i].id);
      }
      setSelectedBlocks(newSelection);
    } else if (e.ctrlKey || e.metaKey) {
      setSelectedBlocks(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(id)) {
          newSelection.delete(id);
        } else {
          newSelection.add(id);
        }
        return newSelection;
      });
    } else {
      setSelectedBlocks(new Set([id]));
    }
  }, [state.blocks, setSelectedBlocks]);

  const handleMouseDown = useCallback((id: string, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left mouse button

    const target = e.target as HTMLElement;
    const isContentEditable = target.hasAttribute('contenteditable');
    
    lastMousePosition.current = { x: e.clientX, y: e.clientY };

    if (isContentEditable) {
      // We're starting a text selection
      isTextSelection.current = true;
      selectionStartBlock.current = id;
      
      // Get the selection offset if possible
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        selectionStartOffset.current = range.startOffset;
        
        // Initialize multi-block selection
        multiBlockSelection.current = {
          startBlock: id,
          startOffset: range.startOffset,
          endBlock: id,
          endOffset: range.startOffset,
          selectedText: ''
        };
      }
      return;
    }

    // If not in contentEditable, handle block selection
    e.preventDefault();
    isDragging.current = true;
    dragStartBlock.current = id;
    dragEndBlock.current = id;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !dragStartBlock.current) return;

    const deltaX = e.clientX - lastMousePosition.current.x;
    const deltaY = e.clientY - lastMousePosition.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < 5) return;

    lastMousePosition.current = { x: e.clientX, y: e.clientY };

    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element) return;

    const blockElement = element.closest('[data-block-id]');
    if (!blockElement) return;

    const blockId = blockElement.getAttribute('data-block-id');
    if (!blockId || blockId === dragEndBlock.current) return;

    dragEndBlock.current = blockId;
    updateDragSelection(dragStartBlock.current, blockId, e.shiftKey);

    const container = document.querySelector('.screenplay-content');
    if (container) {
      const rect = container.getBoundingClientRect();
      const scrollSpeed = 15;
      
      if (e.clientY < rect.top + 100) {
        container.scrollTop -= scrollSpeed;
      } else if (e.clientY > rect.bottom - 100) {
        container.scrollTop += scrollSpeed;
      }
    }
  }, []);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (isDragging.current && dragStartBlock.current === dragEndBlock.current) {
      // If it was just a click (no drag), don't select the block
      // This is now handled by double-click
    }

    isDragging.current = false;
    dragStartBlock.current = null;
    dragEndBlock.current = null;
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const updateDragSelection = useCallback((startId: string, endId: string, appendToSelection = false) => {
    const startIdx = state.blocks.findIndex(b => b.id === startId);
    const endIdx = state.blocks.findIndex(b => b.id === endId);
    if (startIdx === -1 || endIdx === -1) return;

    const [start, end] = startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
    const newSelection = appendToSelection ? new Set(state.selectedBlocks) : new Set<string>();
    
    for (let i = start; i <= end; i++) {
      newSelection.add(state.blocks[i].id);
    }
    
    setSelectedBlocks(newSelection);
  }, [state.blocks, state.selectedBlocks, setSelectedBlocks]);

  // Track text selection across multiple blocks
  useEffect(() => {
    const handleSelectionChange = () => {
      // Only track selection when in text selection mode
      if (!isTextSelection.current && multiBlockSelection.current.startBlock === null) return;
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      
      // Find the blocks containing the start and end of the selection
      const startBlockId = findBlockIdFromNode(range.startContainer);
      const endBlockId = findBlockIdFromNode(range.endContainer);
      
      if (!startBlockId || !endBlockId) return;
      
      // If we don't have a start block yet, set it now
      if (!multiBlockSelection.current.startBlock) {
        multiBlockSelection.current.startBlock = startBlockId;
        multiBlockSelection.current.startOffset = range.startOffset;
      }
      
      // Update the multi-block selection
      multiBlockSelection.current = {
        ...multiBlockSelection.current,
        endBlock: endBlockId,
        endOffset: range.endOffset,
        selectedText: selection.toString()
      };
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  // Handle mouseup for text selection
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isTextSelection.current) {
        isTextSelection.current = false;
        
        // If we have a valid selection, capture it
        if (multiBlockSelection.current.startBlock && 
            multiBlockSelection.current.endBlock &&
            multiBlockSelection.current.selectedText) {
          // The selection is already captured in the selectionchange handler
        }
        
        selectionStartBlock.current = null;
      }
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Handle click outside to clear selection
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isEditorClick = target.closest('.screenplay-content');
      const isFormatButtonClick = target.closest('.format-buttons');
      
      if (!isEditorClick && !isFormatButtonClick) {
        setSelectedBlocks(new Set());
        
        // Clear multi-block selection
        multiBlockSelection.current = {
          startBlock: null,
          startOffset: 0,
          endBlock: null,
          endOffset: 0,
          selectedText: ''
        };
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSelectedBlocks]);

  // Handle global copy/cut keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle specific keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        // Only handle if we have a multi-block selection
        if (multiBlockSelection.current.startBlock && 
            multiBlockSelection.current.endBlock && 
            multiBlockSelection.current.startBlock !== multiBlockSelection.current.endBlock &&
            multiBlockSelection.current.selectedText) {
            
          // Copy: Ctrl+C
          if (e.key === 'c') {
            handleCopyMultiBlockSelection();
          }
          
          // Cut: Ctrl+X
          if (e.key === 'x') {
            handleCutMultiBlockSelection();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleCopyMultiBlockSelection, handleCutMultiBlockSelection]);

  // Clear selection when pressing a key while not editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || 
          e.key === 'Shift' || e.key === 'Tab' || 
          e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
          e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        return;
      }

      if (state.selectedBlocks.size > 0) {
        setSelectedBlocks(new Set());
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedBlocks, setSelectedBlocks]);

  return {
    handleContentChange,
    handleEnterKey,
    handleKeyDown,
    handleBlockClick,
    handleBlockDoubleClick,
    handleFormatChange,
    handleMouseDown,
  };
};