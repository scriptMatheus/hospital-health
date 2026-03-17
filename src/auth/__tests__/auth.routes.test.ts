process.env.TOKEN_SECRET = "test-secret";

import "reflect-metadata";
import express from "express";
import supertest from "supertest";

jest.mock("../../utils/authenticateRequest", () => ({
  generateToken: () => "fake-token",
  authenticateRequest: (_req: any, _res: any, next: any) => next(),
}));

import { authRoutes } from "../../routes/auth.routes";

const BASE_URL = "/api";

const app = express();
app.use(express.json());
app.use(`${BASE_URL}/auth`, authRoutes);

describe("POST /auth", () => {
  it("deve retornar status 200", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/auth`)
      .send({ email: "teste@teste.com" });
    expect(response.status).toBe(200);
  });

  it("deve retornar um token no body", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/auth`)
      .send({ email: "teste@teste.com" });
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
  });

  it("deve retornar o token gerado pelo AuthService", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/auth`)
      .send({ email: "teste@teste.com" });
    expect(response.body.token).toBe("fake-token");
  });

  it("deve retornar 400 quando email não for enviado", async () => {
    const response = await supertest(app).post(`${BASE_URL}/auth`);
    expect(response.status).toBe(400);
  });
});
