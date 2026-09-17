# Recursive React Menu

A recursive React + TypeScript menu/tree component using `useReducer` and React Context.

## Features

- Unlimited nesting
- Add items
- Remove items
- Update items through the reducer/context API
- Expand/collapse
- Selection
- Item click callback
- Immutable tree operations
- Vite + React + TypeScript

## Run

```bash
yarn install
yarn dev
```

Build:

```bash
yarn build
```

## Structure

```text
src/
├── Menu.tsx
├── MenuItem.tsx
├── MenuContext.tsx
├── menuActions.ts
├── menuReducer.ts
├── treeOperations.ts
├── types.ts
├── main.tsx
└── styles.css
```

## Usage

```tsx
<Menu
  items={items}
  onItemClick={(item) => {
    console.log(item);
  }}
/>
```

The recursive component consumes state/actions from context, so callbacks and state do not need to be passed through every recursive level.

## Next extension

The reducer/context architecture is ready to add:

- `MOVE_ITEM`
- sibling reordering
- drag-and-drop
- rename UI
- keyboard navigation
- lazy-loaded children
- controlled/uncontrolled state
