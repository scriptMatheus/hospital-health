process.env.TOKEN_SECRET = "test-secret";

import "reflect-metadata";
import express from "express";
import supertest from "supertest";

jest.mock("../../utils/authenticateRequest", () => ({
  generateToken: () => "fake-token",
  authenticateRequest: (_req: any, _res: any, next: any) => next(),
}));

const mockList = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock("../services/InstitutionService", () => ({
  InstitutionService: jest.fn().mockImplementation(() => ({
    list: mockList,
    findById: mockFindById,
    createInstitution: mockCreate,
    update: mockUpdate,
  })),
}));

import { institutionRoutes } from "../../routes/institution.routes";

const BASE_URL = "/api";

const app = express();
app.use(express.json());
app.use(`${BASE_URL}/instituicoes`, institutionRoutes);

const fakeInstitution = {
  id: "uuid-123",
  name: "Hospital Teste",
  type: 1,
  status: true,
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── POST / ────────────────────────────────────────────────────────────────────

describe("POST /instituicoes", () => {
  it("deve criar instituição e retornar 200", async () => {
    mockCreate.mockResolvedValueOnce(fakeInstitution);

    const response = await supertest(app)
      .post(`${BASE_URL}/instituicoes`)
      .send({ name: "Hospital Teste", type: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ name: "Hospital Teste" });
  });

  it("deve retornar 400 quando name não for enviado", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/instituicoes`)
      .send({ type: 1 });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/falta name ou type/);
  });

  it("deve retornar 400 quando type não for enviado", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/instituicoes`)
      .send({ name: "Hospital Teste" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/falta name ou type/);
  });

  it("deve retornar 400 quando name for muito curto", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/instituicoes`)
      .send({ name: "AB", type: 1 });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/nome muito curto/);
  });

  it("deve retornar 400 quando name ultrapassar 100 caracteres", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/instituicoes`)
      .send({ name: "A".repeat(101), type: 1 });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/100 caracteres/);
  });

  it("deve retornar 400 quando type for inválido", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/instituicoes`)
      .send({ name: "Hospital Teste", type: 9 });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/type deve ser 0, 1 ou 2/);
  });

  it("deve retornar 400 quando service lançar erro", async () => {
    mockCreate.mockRejectedValueOnce(new Error("db error"));

    const response = await supertest(app)
      .post(`${BASE_URL}/instituicoes`)
      .send({ name: "Hospital Teste", type: 1 });

    expect(response.status).toBe(400);
  });
});

// ─── GET / ─────────────────────────────────────────────────────────────────────

describe("GET /instituicoes", () => {
  it("deve listar instituições e retornar 200", async () => {
    mockList.mockResolvedValueOnce([fakeInstitution]);

    const response = await supertest(app).get(`${BASE_URL}/instituicoes`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
  });

  it("deve retornar 503 quando service lançar erro", async () => {
    mockList.mockRejectedValueOnce(new Error("db error"));

    const response = await supertest(app).get(`${BASE_URL}/instituicoes`);

    expect(response.status).toBe(503);
  });
});

// ─── GET /:institutionId ────────────────────────────────────────────────────────

describe("GET /instituicoes/:institutionId", () => {
  it("deve retornar instituição por id com status 200", async () => {
    mockFindById.mockResolvedValueOnce(fakeInstitution);

    const response = await supertest(app).get(`${BASE_URL}/instituicoes/uuid-123`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: "uuid-123" });
  });

  it("deve retornar 400 quando id não existir", async () => {
    mockFindById.mockResolvedValueOnce(null);

    const response = await supertest(app).get(`${BASE_URL}/instituicoes/inexistente`);

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/não existe/);
  });

  it("deve retornar 503 quando service lançar erro", async () => {
    mockFindById.mockRejectedValueOnce(new Error("db error"));

    const response = await supertest(app).get(`${BASE_URL}/instituicoes/uuid-123`);

    expect(response.status).toBe(503);
  });
});

// ─── PATCH /:institutionId ──────────────────────────────────────────────────────

describe("PATCH /instituicoes/:institutionId", () => {
  it("deve atualizar instituição e retornar 200", async () => {
    const updated = { ...fakeInstitution, name: "Hospital Atualizado" };
    mockFindById.mockResolvedValueOnce(fakeInstitution);
    mockUpdate.mockResolvedValueOnce(updated);

    const response = await supertest(app)
      .patch(`${BASE_URL}/instituicoes/uuid-123`)
      .send({ name: "Hospital Atualizado", type: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ name: "Hospital Atualizado" });
  });

  it("deve retornar 400 quando name não for enviado", async () => {
    const response = await supertest(app)
      .patch(`${BASE_URL}/instituicoes/uuid-123`)
      .send({ type: 1 });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/falta name ou type/);
  });

  it("deve retornar 400 quando type for inválido", async () => {
    const response = await supertest(app)
      .patch(`${BASE_URL}/instituicoes/uuid-123`)
      .send({ name: "Hospital Teste", type: 5 });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/type deve ser 0, 1 ou 2/);
  });

  it("deve retornar 400 quando institutionId não existir no banco", async () => {
    mockFindById.mockResolvedValueOnce(null);

    const response = await supertest(app)
      .patch(`${BASE_URL}/instituicoes/inexistente`)
      .send({ name: "Hospital Teste", type: 1 });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/não existe/);
  });

  it("deve retornar 503 quando service lançar erro", async () => {
    mockFindById.mockRejectedValueOnce(new Error("db error"));

    const response = await supertest(app)
      .patch(`${BASE_URL}/instituicoes/uuid-123`)
      .send({ name: "Hospital Teste", type: 1 });

    expect(response.status).toBe(503);
  });
});
