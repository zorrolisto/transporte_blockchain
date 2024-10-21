import { sql } from "drizzle-orm";
import { int, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator(
  (name) => `transporte_blockchain_${name}`,
);

const defaultFields = {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  createdById: text("created_by", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
};

export const users = createTable("user", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text("username", { length: 255 }).notNull(),
  type: text("type", { length: 20 }).notNull(),
  name: text("name", { length: 255 }),
  email: text("email", { length: 255 }).notNull(),
  password: text("password", { length: 255 }).notNull(),
});

export const embarcacion = createTable("embarcacion", {
  ...defaultFields,
  nombre: text("nombre").notNull(),
  diasEnLlegar: int("dias_en_llegar").notNull(),
  fechaEnvio: int("fecha_envio", { mode: "timestamp" }).notNull(),
  paisOrigen: text("pais_origen").notNull(),
  paisDestino: text("pais_destino").notNull(),
  tipoDeEnvio: text("tipo_envio").notNull(),
});

export const containers = createTable("container", {
  ...defaultFields,
  fruto: text("fruto").notNull(),
  gramosPorClamshell: int("gramos").notNull(),
  clamshellsPorCaja: int("clamshells").notNull(),
  cajasPorPallet: int("cajas").notNull(),
  palletsPorContainer: int("pallets").notNull(),
  fechaEmpaquetacion: int("fecha_empaquetacion", {
    mode: "timestamp",
  }).notNull(),
  embarcacionId: int("embarcacion_id").references(() => embarcacion.id),
});

export const transactionsM = createTable("transactions_m", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  hashT: text("hash_t", { length: 256 }).notNull(),
  embarcacionId: int("embarcacion_id")
    .notNull()
    .references(() => embarcacion.id),
});
