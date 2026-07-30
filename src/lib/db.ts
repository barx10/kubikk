import Dexie, { type EntityTable } from "dexie";
import type { PlannedRoute } from "../types/route.js";

class KubikkDatabase extends Dexie {
  routes!: EntityTable<PlannedRoute, "id">;

  constructor() {
    super("kubikk");
    this.version(1).stores({
      routes: "id, name, createdAt",
    });
  }
}

export const db = new KubikkDatabase();

export async function saveRoute(route: PlannedRoute): Promise<void> {
  await db.routes.put(route);
}

export async function deleteRoute(id: string): Promise<void> {
  await db.routes.delete(id);
}

export async function renameRoute(id: string, name: string): Promise<void> {
  await db.routes.update(id, { name });
}
