export type Equation = {
  latex: string;
  display: boolean;
  fontSize: number;
  color: string;
  svg: string;
  width: number;
  height: number;
};

export type WebviewToDriver =
  | { type: "ready" }
  | { type: "insert"; equation: Equation }
  | { type: "drop"; equation: Equation; x: number; y: number }
  | { type: "update"; drawdyElementId: string; equation: Equation };

export type DriverToWebview =
  | { type: "init"; theme: "dark" | "light"; color: string }
  | { type: "styling"; css: string; theme: "dark" | "light"; color: string }
  | {
      type: "edit";
      drawdyElementId: string;
      latex: string;
      display: boolean;
      fontSize: number;
      color: string;
    }
  | { type: "edit-cleared" };
