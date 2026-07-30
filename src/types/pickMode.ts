export type PickMode = "start" | "end" | "via";

export const PICK_MODE_LABEL: Record<PickMode, string> = {
  start: "Klikk i kartet for å sette startpunkt",
  end: "Klikk i kartet for å sette sluttpunkt",
  via: "Klikk i kartet for å legge til et via-punkt",
};
