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

jest.mock("../services/ProfessionalService", () => ({
  ProfessionalService: jest.fn().mockImplementation(() => ({
    list: mockList,
    findById: mockFindById,
    createProfessional: mockCreate,
    update: mockUpdate,
  })),
}));

import { professionalRoutes } from "../../routes/professional.routes";

const BASE_URL = "/api";

const app = express();
app.use(express.json());
app.use(`${BASE_URL}/profissionais`, professionalRoutes);

const fakeProfessional = {
  id: "uuid-456",
  name: "Dr. João Silva",
  crm: "CRM123456",
  cpf: "52998224725", // CPF válido
  specialty: "Cardiologia",
  status: true,
  createdAt: new Date().toISOString(),
};

const cpfValido = "52998224725";
const cpfInvalido = "00000000000";

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── POST / ────────────────────────────────────────────────────────────────────

describe("POST /profissionais", () => {
  it("deve criar profissional e retornar 200", async () => {
    mockCreate.mockResolvedValueOnce(fakeProfessional);

    const response = await supertest(app)
      .post(`${BASE_URL}/profissionais`)
      .send({ name: "Dr. João Silva", crm: "CRM123456", cpf: cpfValido, specialty: "Cardiologia" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ name: "Dr. João Silva" });
  });

  it("deve retornar 400 quando name não for enviado", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/profissionais`)
      .send({ crm: "CRM123456", cpf: cpfValido, specialty: "Cardiologia" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/falta name/);
  });

  it("deve retornar 400 quando crm não for enviado", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/profissionais`)
      .send({ name: "Dr. João Silva", cpf: cpfValido, specialty: "Cardiologia" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/falta/);
  });

  it("deve retornar 400 quando cpf não for enviado", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/profissionais`)
      .send({ name: "Dr. João Silva", crm: "CRM123456", specialty: "Cardiologia" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/falta/);
  });

  it("deve retornar 400 quando specialty não for enviado", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/profissionais`)
      .send({ name: "Dr. João Silva", crm: "CRM123456", cpf: cpfValido });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/falta/);
  });

  it("deve retornar 400 quando name for muito curto", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/profissionais`)
      .send({ name: "AB", crm: "CRM123456", cpf: cpfValido, specialty: "Cardiologia" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/nome muito curto/);
  });

  it("deve retornar 400 quando name ultrapassar 150 caracteres", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/profissionais`)
      .send({ name: "A".repeat(151), crm: "CRM123456", cpf: cpfValido, specialty: "Cardiologia" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/150 caracteres/);
  });

  it("deve retornar 400 quando CPF for inválido", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/profissionais`)
      .send({ name: "Dr. João Silva", crm: "CRM123456", cpf: cpfInvalido, specialty: "Cardiologia" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/CPF inválido/);
  });

  it("deve retornar 400 quando service lançar erro", async () => {
    mockCreate.mockRejectedValueOnce(new Error("db error"));

    const response = await supertest(app)
      .post(`${BASE_URL}/profissionais`)
      .send({ name: "Dr. João Silva", crm: "CRM123456", cpf: cpfValido, specialty: "Cardiologia" });

    expect(response.status).toBe(400);
  });
});

// ─── GET / ─────────────────────────────────────────────────────────────────────

describe("GET /profissionais", () => {
  it("deve listar profissionais e retornar 200", async () => {
    mockList.mockResolvedValueOnce([fakeProfessional]);

    const response = await supertest(app).get(`${BASE_URL}/profissionais`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
  });

  it("deve retornar 503 quando service lançar erro", async () => {
    mockList.mockRejectedValueOnce(new Error("db error"));

    const response = await supertest(app).get(`${BASE_URL}/profissionais`);

    expect(response.status).toBe(503);
  });
});

// ─── GET /:professionalId ───────────────────────────────────────────────────────

describe("GET /profissionais/:professionalId", () => {
  it("deve retornar profissional por id com status 200", async () => {
    mockFindById.mockResolvedValueOnce(fakeProfessional);

    const response = await supertest(app).get(`${BASE_URL}/profissionais/uuid-456`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: "uuid-456" });
  });

  it("deve retornar 400 quando id não existir", async () => {
    mockFindById.mockResolvedValueOnce(null);

    const response = await supertest(app).get(`${BASE_URL}/profissionais/inexistente`);

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/não existe/);
  });

  it("deve retornar 503 quando service lançar erro", async () => {
    mockFindById.mockRejectedValueOnce(new Error("db error"));

    const response = await supertest(app).get(`${BASE_URL}/profissionais/uuid-456`);

    expect(response.status).toBe(503);
  });
});

// ─── PATCH /:professionalId ─────────────────────────────────────────────────────

describe("PATCH /profissionais/:professionalId", () => {
  it("deve atualizar profissional e retornar 200", async () => {
    const updated = { ...fakeProfessional, name: "Dr. João Atualizado" };
    mockFindById.mockResolvedValueOnce(fakeProfessional);
    mockUpdate.mockResolvedValueOnce(updated);

    const response = await supertest(app)
      .patch(`${BASE_URL}/profissionais/uuid-456`)
      .send({ name: "Dr. João Atualizado", crm: "CRM123456", cpf: cpfValido, specialty: "Cardiologia" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ name: "Dr. João Atualizado" });
  });

  it("deve retornar 400 quando parâmetros obrigatórios faltarem", async () => {
    const response = await supertest(app)
      .patch(`${BASE_URL}/profissionais/uuid-456`)
      .send({ crm: "CRM123456" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/falta/);
  });

  it("deve retornar 400 quando name for muito curto", async () => {
    const response = await supertest(app)
      .patch(`${BASE_URL}/profissionais/uuid-456`)
      .send({ name: "AB", crm: "CRM123456", cpf: cpfValido, specialty: "Cardiologia" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/nome muito curto/);
  });

  it("deve retornar 400 quando CPF for inválido", async () => {
    const response = await supertest(app)
      .patch(`${BASE_URL}/profissionais/uuid-456`)
      .send({ name: "Dr. João Silva", crm: "CRM123456", cpf: cpfInvalido, specialty: "Cardiologia" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/CPF inválido/);
  });

  it("deve retornar 400 quando professionalId não existir no banco", async () => {
    mockFindById.mockResolvedValueOnce(null);

    const response = await supertest(app)
      .patch(`${BASE_URL}/profissionais/inexistente`)
      .send({ name: "Dr. João Silva", crm: "CRM123456", cpf: cpfValido, specialty: "Cardiologia" });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/não existe/);
  });

  it("deve retornar 503 quando service lançar erro", async () => {
    mockFindById.mockRejectedValueOnce(new Error("db error"));

    const response = await supertest(app)
      .patch(`${BASE_URL}/profissionais/uuid-456`)
      .send({ name: "Dr. João Silva", crm: "CRM123456", cpf: cpfValido, specialty: "Cardiologia" });

    expect(response.status).toBe(503);
  });
});
