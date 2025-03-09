import React, { useRef, useEffect } from 'react';
import { ScreenplayEditorProps } from '../types';
import { useEditorState } from '../hooks/useEditorState';
import { useBlockHandlers } from '../hooks/useBlockHandlers';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { organizeBlocksIntoPages } from '../utils/blockUtils';
import BlockComponent from './BlockComponent';
import FormatButtons from './ScreenplayEditor/FormatButtons';
import Page from './ScreenplayEditor/Page';
import { useHotkeys } from '../hooks/useHotkeys';

const ScreenplayEditor: React.FC<ScreenplayEditorProps> = ({ isDarkMode, zoomLevel }) => {
  const {
    state,
    setState,
    addToHistory,
    handleUndo,
    handleRedo,
    updateBlocks,
    selectAllBlocks,
  } = useEditorState();

  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const {
    handleContentChange,
    handleEnterKey,
    handleKeyDown,
    handleBlockClick,
    handleBlockDoubleClick,
    handleFormatChange,
    handleMouseDown,
  } = useBlockHandlers(
    state,
    blockRefs,
    addToHistory,
    updateBlocks,
    (blocks) => setState(prev => ({ ...prev, selectedBlocks: blocks }))
  );

  useAutoScroll(state.activeBlock, state.blocks, blockRefs);

  // Use the custom hook for keyboard shortcuts
  useHotkeys({
    handleUndo,
    handleRedo,
    selectAllBlocks,
    blocks: state.blocks,
    activeBlock: state.activeBlock,
    handleFormatChange,
  });

  const pages = organizeBlocksIntoPages(state.blocks);

  return (
    <div className="flex-1 overflow-auto screenplay-content relative user-select-text" data-screenplay-editor="true">
      <div 
        className="max-w-[210mm] mx-auto my-8 screenplay-pages pb-24 user-select-text"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center'
        }}
        data-screenplay-pages="true"
      >
        <div className={`rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="relative user-select-text">
              {pages.map((pageBlocks, pageIndex) => (
                <Page
                  key={pageIndex}
                  pageIndex={pageIndex}
                  blocks={pageBlocks}
                  isDarkMode={isDarkMode}
                  header={state.header}
                  editingHeader={state.editingHeader}
                  onHeaderChange={(header) => setState(prev => ({ ...prev, header }))}
                  onEditingHeaderChange={(editingHeader) => setState(prev => ({ ...prev, editingHeader }))}
                  onContentChange={handleContentChange}
                  onKeyDown={handleKeyDown}
                  onBlockFocus={(id) => setState(prev => ({ ...prev, activeBlock: id }))}
                  onBlockClick={handleBlockClick}
                  onBlockDoubleClick={handleBlockDoubleClick}
                  onBlockMouseDown={handleMouseDown}
                  selectedBlocks={state.selectedBlocks}
                  activeBlock={state.activeBlock}
                  blockRefs={blockRefs}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <FormatButtons
        isDarkMode={isDarkMode}
        activeBlock={state.activeBlock}
        onFormatChange={handleFormatChange}
        blocks={state.blocks}
        className="format-buttons"
      />
    </div>
  );
};

export default ScreenplayEditor;