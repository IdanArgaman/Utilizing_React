import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Menu } from "./Menu";
import type { MenuItem } from "./types";
import "./styles.css";

const items: MenuItem[] = [
  {
    id: "products",
    label: "Products",
    children: [
      {
        id: "laptops",
        label: "Laptops",
        children: [
          {
            id: "macbook",
            label: "MacBook",
            children: [],
          },
        ],
      },
      {
        id: "phones",
        label: "Phones",
        children: [
          {
            id: "iphone",
            label: "iPhone",
            children: [],
          },
          {
            id: "android",
            label: "Android",
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: "about",
    label: "About",
    children: [],
  },
];

function App() {
  return (
    <main>
      <h1>Recursive React Menu</h1>

      <Menu
        items={items}
        onItemClick={(item) => {
          console.log("Menu item clicked:", item);
        }}
      />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);