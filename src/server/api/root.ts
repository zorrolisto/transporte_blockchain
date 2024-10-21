import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { transactionsRouter } from "./routers/trans";
import { usersRouter } from "./routers/user";
import { containerRouter } from "./routers/container";
import { embarqueRouter } from "./routers/embarque";

export const appRouter = createTRPCRouter({
  transactions: transactionsRouter,
  users: usersRouter,
  containers: containerRouter,
  embarcaciones: embarqueRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
