import type { MenuItem as MenuItemType } from "./types";
import { MenuProvider, useMenu } from "./MenuContext";
import { MenuItem } from "./MenuItem";

type MenuProps = {
  items: MenuItemType[];
  onItemClick?: (item: MenuItemType) => void;
};

export function Menu({ items, onItemClick }: MenuProps) {
  return (
    <MenuProvider initialItems={items}>
      <MenuContent onItemClick={onItemClick} />
    </MenuProvider>
  );
}

function MenuContent({
  onItemClick,
}: {
  onItemClick?: (item: MenuItemType) => void;
}) {
  const { state } = useMenu();

  return (
    <div>
      {state.items.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          level={0}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
}