import type { MenuItem as MenuItemType } from "./types";
import { useMenu } from "./MenuContext";

type MenuItemProps = {
  item: MenuItemType;
  level: number;
  onItemClick?: (item: MenuItemType) => void;
};

export function MenuItem({
  item,
  level,
  onItemClick,
}: MenuItemProps) {
  const {
    state,
    selectItem,
    toggleExpanded,
    addItem,
    removeItem,
  } = useMenu();

  const isSelected = state.selectedId === item.id;
  const isExpanded = state.expandedIds.has(item.id);
  const hasChildren = item.children.length > 0;

  const handleAdd = () => {
    const newItem: MenuItemType = {
      id: crypto.randomUUID(),
      label: "New item",
      children: [],
    };

    addItem(item.id, newItem);

    if (!isExpanded) {
      toggleExpanded(item.id);
    }
  };

  const handleClick = () => {
    selectItem(item.id);
    onItemClick?.(item);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 0",
          paddingLeft: level * 20,
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => toggleExpanded(item.id)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        ) : (
          <span style={{ width: 28 }} />
        )}

        <button
          type="button"
          onClick={handleClick}
          style={{
            fontWeight: isSelected ? 700 : 400,
            minWidth: 120,
            textAlign: "left",
          }}
        >
          {item.label}
        </button>

        <button type="button" onClick={handleAdd}>
          +
        </button>

        <button
          type="button"
          onClick={() => removeItem(item.id)}
        >
          ×
        </button>
      </div>

      {isExpanded &&
        item.children.map((child) => (
          <MenuItem
            key={child.id}
            item={child}
            level={level + 1}
            onItemClick={onItemClick}
          />
        ))}
    </div>
  );
}