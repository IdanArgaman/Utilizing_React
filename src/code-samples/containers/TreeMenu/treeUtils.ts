// ============================================================================
// Tree data model + immutable helpers for TreeMenu.
// ============================================================================
//
// The tricky part of any "menu/tree with sub items" component isn't the
// rendering (that's just a component calling itself) - it's updating deeply
// nested state WITHOUT mutating it. React only re-renders when it sees a new
// object reference, so `node.children.push(...)` or `delete node.x` would
// silently fail to trigger a re-render (and would corrupt state shared with
// prior renders/undo history). Every function below returns a brand new tree
// from the root down to whatever node changed, structurally sharing every
// branch that *didn't* change.

export interface TreeNode {
  id: string;
  name: string;
  isExpanded: boolean;
  children: TreeNode[];
}

let nextId = 1;
// crypto.randomUUID() would also work, but an incrementing counter keeps the
// ids short and readable while poking around in this demo.
export function makeId(): string {
  return `node-${nextId++}`;
}

export function createNode(name: string, children: TreeNode[] = []): TreeNode {
  return { id: makeId(), name, isExpanded: true, children };
}

// Walks the tree looking for `id`, applying `updater` to that node's children
// array wherever it's found. Every ancestor on the path back to the root is
// shallow-copied (new object) so the change is visible to React; every
// sibling subtree that wasn't touched keeps its original reference.
function updateChildrenById(
  nodes: TreeNode[],
  id: string,
  updater: (children: TreeNode[]) => TreeNode[]
): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, children: updater(node.children) };
    }
    if (node.children.length === 0) {
      return node;
    }
    const updatedChildren = updateChildrenById(node.children, id, updater);
    return updatedChildren === node.children
      ? node
      : { ...node, children: updatedChildren };
  });
}

export function addChild(tree: TreeNode[], parentId: string, name: string): TreeNode[] {
  return updateChildrenById(tree, parentId, (children) => [
    ...children,
    createNode(name),
  ]);
}

export function removeNode(tree: TreeNode[], id: string): TreeNode[] {
  const withoutId = tree
    .filter((node) => node.id !== id)
    .map((node) => {
      const filteredChildren = removeNode(node.children, id);
      return filteredChildren === node.children
        ? node
        : { ...node, children: filteredChildren };
    });

  // Bail out early with the original array reference if nothing changed at
  // this level, so untouched branches above keep structural sharing too.
  if (
    withoutId.length === tree.length &&
    withoutId.every((node, i) => node === tree[i])
  ) {
    return tree;
  }
  return withoutId;
}

export function renameNode(tree: TreeNode[], id: string, name: string): TreeNode[] {
  return tree.map((node) => {
    if (node.id === id) {
      return { ...node, name };
    }
    const renamedChildren = renameNode(node.children, id, name);
    return renamedChildren === node.children
      ? node
      : { ...node, children: renamedChildren };
  });
}

export function toggleExpanded(tree: TreeNode[], id: string): TreeNode[] {
  return tree.map((node) => {
    if (node.id === id) {
      return { ...node, isExpanded: !node.isExpanded };
    }
    const updatedChildren = toggleExpanded(node.children, id);
    return updatedChildren === node.children
      ? node
      : { ...node, children: updatedChildren };
  });
}

// Sets `isExpanded` to the same value on every node in the tree - powers
// "Expand All" / "Collapse All". Recurses all the way down regardless of a
// node's current expanded state, since a collapsed folder can still contain
// expanded descendants that also need to flip.
export function setAllExpanded(tree: TreeNode[], isExpanded: boolean): TreeNode[] {
  return tree.map((node) => ({
    ...node,
    isExpanded,
    children: setAllExpanded(node.children, isExpanded),
  }));
}
