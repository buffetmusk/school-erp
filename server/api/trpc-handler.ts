import type { IncomingMessage, ServerResponse } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "../routers";
import { MOCK_USER } from "../mock";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({
      req: {} as any,
      res: {} as any,
      user: MOCK_USER as any,
    }),
  })
);

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req as any, res as any);
}
