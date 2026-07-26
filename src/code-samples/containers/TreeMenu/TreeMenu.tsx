import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TreeNode,
  createNode,
  addChild,
  removeNode,
  renameNode,
  toggleExpanded,
  setAllExpanded,
} from './treeUtils';

// ============================================================================
// CODE SAMPLE: Recursive Tree / Menu with Add, Rename, Remove & Selection
// ============================================================================
//
// The nested structure makes this harder than a flat list in two ways:
//
// 1. RENDERING is recursive: a folder's children are themselves nodes that
//    can have children, so `TreeNodeItem` renders itself for each child.
//    There's no fixed depth - the same component handles a leaf, a folder
//    of leaves, or a folder ten levels deep.
//
// 2. STATE UPDATES are the hard part. The whole tree lives as ONE state
//    value in the root `TreeMenu` component (not scattered across each
//    node), because operations like "remove this node" or "add a child to
//    this node" need to replace a piece of a deeply nested structure
//    immutably - see treeUtils.ts for the recursive copy-on-write helpers
//    that make that possible. Every node only receives the small slice of
//    state and callbacks it needs as props; it never touches the tree
//    directly.
//
// Click-to-select is handled by storing the selected node's `id` (not the
// node object itself) in state, and comparing `id === selectedId` at render
// time - this is the same "identity by id, not by reference" pattern you'd
// use for a controlled <select> or a list of radio buttons.
//
// `isExpanded` lives ON the TreeNode itself (see treeUtils.ts), as part of
// the same shared tree state, rather than as local useState inside each
// TreeNodeItem. That's what makes cross-tree operations like "Expand All" /
// "Collapse All" possible below - a parent-level action needs to see and
// change every node's expanded flag at once, which local per-node state
// can't do.

const initialTree: TreeNode[] = [
  {
    id: 'root-src',
    name: 'src',
    isExpanded: true,
    children: [
      {
        id: 'root-components',
        name: 'components',
        isExpanded: true,
        children: [
          createNode('Header.tsx'),
          createNode('Footer.tsx'),
        ],
      },
      {
        id: 'root-hooks',
        name: 'hooks',
        isExpanded: true,
        children: [createNode('useTree.ts')],
      },
      createNode('index.tsx'),
    ],
  },
  {
    id: 'root-docs',
    name: 'docs',
    isExpanded: true,
    children: [createNode('README.md')],
  },
];

interface TreeNodeItemProps {
  node: TreeNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onRename: (id: string) => void;
  onRemove: (id: string) => void;
}

function TreeNodeItem({
  node,
  depth,
  selectedId,
  onSelect,
  onToggleExpand,
  onAddChild,
  onRename,
  onRemove,
}: TreeNodeItemProps) {
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedId;

  return (
    <li style={{ listStyle: 'none' }}>
      <div
        onClick={() => onSelect(node.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.2rem 0.4rem',
          marginLeft: depth * 20,
          cursor: 'pointer',
          borderRadius: 4,
          background: isSelected ? '#fa923f33' : 'transparent',
          border: isSelected ? '1px solid #fa923f' : '1px solid transparent',
        }}
      >
        {/* Expand/collapse caret - its own click must NOT also trigger
            selection, hence stopPropagation before toggling. */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggleExpand(node.id);
          }}
          style={{
            width: 14,
            display: 'inline-block',
            visibility: hasChildren ? 'visible' : 'hidden',
          }}
        >
          {node.isExpanded ? '▼' : '▶'}
        </span>

        <span>{hasChildren ? '📁' : '📄'}</span>
        <span style={{ flex: 1 }}>{node.name}</span>

        {/* Row actions - each stops propagation so clicking a button
            doesn't also select the row underneath it. */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(node.id);
          }}
          title="Add sub item"
        >
          +
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRename(node.id);
          }}
          title="Rename"
        >
          &#9998;
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(node.id);
          }}
          title="Remove"
        >
          &times;
        </button>
      </div>

      {hasChildren && node.isExpanded && (
        <ul style={{ margin: 0, padding: 0 }}>
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onAddChild={onAddChild}
              onRename={onRename}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function TreeMenu() {
  const [tree, setTree] = useState<TreeNode[]>(initialTree);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleAddChild = (parentId: string) => {
    const name = window.prompt('New item name:', 'New Item');
    if (!name) return;
    setTree((current) => addChild(current, parentId, name));
  };

  const handleRename = (id: string) => {
    const name = window.prompt('Rename to:');
    if (!name) return;
    setTree((current) => renameNode(current, id, name));
  };

  const handleRemove = (id: string) => {
    setTree((current) => removeNode(current, id));
    // The node being removed might be the one currently selected (or an
    // ancestor of it) - clear the selection so the UI never points at an id
    // that no longer exists in the tree.
    setSelectedId((current) => (current === id ? null : current));
  };

  const handleAddRoot = () => {
    const name = window.prompt('New top-level item name:', 'New Item');
    if (!name) return;
    setTree((current) => [...current, createNode(name)]);
  };

  const handleToggleExpand = (id: string) => {
    setTree((current) => toggleExpanded(current, id));
  };

  const handleExpandAll = () => setTree((current) => setAllExpanded(current, true));
  const handleCollapseAll = () => setTree((current) => setAllExpanded(current, false));

  return (
    <div>
      <h2>Code Sample: Recursive Tree Menu</h2>
      <Link to="/code-samples">&larr; Back to list</Link>
      <p>
        Click a row to select it. Use <strong>+</strong> to add a sub item,
        the pencil to rename, and &times; to remove a node (and everything
        under it). Expand/collapse with the caret.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <button onClick={handleAddRoot}>+ Add top-level item</button>
        <button onClick={handleExpandAll}>Expand All</button>
        <button onClick={handleCollapseAll}>Collapse All</button>
      </div>

      <ul style={{ margin: 0, padding: 0, maxWidth: 480 }}>
        {tree.map((node) => (
          <TreeNodeItem
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onToggleExpand={handleToggleExpand}
            onAddChild={handleAddChild}
            onRename={handleRename}
            onRemove={handleRemove}
          />
        ))}
      </ul>

      <hr />
      <p>
        Selected node id: <strong>{selectedId ?? '(none)'}</strong>
      </p>
    </div>
  );
}

export default TreeMenu;
