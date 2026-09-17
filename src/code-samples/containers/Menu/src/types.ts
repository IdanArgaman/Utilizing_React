export type MenuItem = {
  id: string;
  label: string;
  children: MenuItem[];
};

export type MenuState = {
  items: MenuItem[];
  selectedId: string | null;
  expandedIds: Set<string>;
};