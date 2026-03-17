import "reflect-metadata";
import "./shared/container/";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import express, { Request, Response, NextFunction } from "express";
import { router } from "./routes";
import { AppError } from "./shared/errors/AppError";
import  blockedOrigins  from "./utils/blockedOrigins.json";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Middleware para bloquear requisições de origens suspeitas
app.use((req, res, next) => {
  const origin = req.header("Origin") || '';
  const userAgent = req.header("User-Agent") || '';

  const isBlocked = blockedOrigins.some(blockedTerm =>
    userAgent.toLowerCase().includes(blockedTerm.toLowerCase())
  );

  if (isBlocked) {
    console.log(`🚫 Requisição bloqueada. User-Agent: ${userAgent} | Origin: ${origin}`);
    return res.status(500).json({
      message: "Acesso negado (user agent bloqueado)",
      error: "Forbidden"
    });
  }

  next();
});

// Middleware para verificar se a URL contém BASE_URL
app.use((req, res, next) => {
  const url = req.originalUrl;

  if (!url.includes(process.env.BASE_URL as string)) {
    console.log(`🚫 Requisição bloqueada. URL não contém a url-base correta: ${url}`);
    return res.status(500).json({
      message: "Acesso negado",
      error: "Forbidden"
    });
  }

  next();
});

app.use(process.env.BASE_URL as string, router);


app.use(
    (err: Error, request: Request, response: Response, next: NextFunction) => {
        if (err instanceof AppError) {
            return response.status(err.statusCode).json({
                validateError: [{ constraints: { message: err.message } }],
            });
        }
        console.error(err);
        return response.status(500).json({
            status: "error",
            message: `Internal server error - ${err}`,
        });
    }
);

const port = 3025;
app.listen(port, () => {
    //@ts-ignore
    console.log("Rodando servidor na porta: ", port);
    
});