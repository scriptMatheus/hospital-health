process.env.TOKEN_SECRET = "test-secret";

import "reflect-metadata";
import express from "express";
import supertest from "supertest";

jest.mock("../../utils/authenticateRequest", () => ({
  generateToken: () => "fake-token",
  authenticateRequest: (_req: any, _res: any, next: any) => next(),
}));

const mockPatientList = jest.fn();
const mockPatientFindById = jest.fn();
const mockPatientCreate = jest.fn();
const mockPatientUpdate = jest.fn();
const mockPatientUpdateStatus = jest.fn();

jest.mock("../services/PatientService", () => ({
  PatientService: jest.fn().mockImplementation(() => ({
    list: mockPatientList,
    findById: mockPatientFindById,
    createPatient: mockPatientCreate,
    update: mockPatientUpdate,
    updateStatus: mockPatientUpdateStatus,
  })),
}));

const mockProfessionalFindById = jest.fn();

jest.mock("../../professionals/services/ProfessionalService", () => ({
  ProfessionalService: jest.fn().mockImplementation(() => ({
    findById: mockProfessionalFindById,
  })),
}));

import { patientRoutes } from "../../routes/patient.routes";

const BASE_URL = "/api";

const app = express();
app.use(express.json());
app.use(`${BASE_URL}/pacientes`, patientRoutes);

const fakePatient = {
  id: "uuid-789",
  name: "Paciente Teste",
  bornDate: "1990-10-10",
  professionalId: "prof-1",
  status: true,
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /pacientes", () => {
  it("deve criar paciente e retornar 200", async () => {
    mockProfessionalFindById.mockResolvedValueOnce({ id: "prof-1" });
    mockPatientCreate.mockResolvedValueOnce(fakePatient);

    const response = await supertest(app)
      .post(`${BASE_URL}/pacientes`)
      .send({ name: "Paciente Teste", bornDate: "1990-10-10", professionalId: "prof-1" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ name: "Paciente Teste" });
  });

  it("deve aceitar bornDate no formato BR (DD/MM/AAAA)", async () => {
    mockProfessionalFindById.mockResolvedValueOnce({ id: "prof-1" });
    mockPatientCreate.mockResolvedValueOnce(fakePatient);

    const response = await supertest(app)
      .post(`${BASE_URL}/pacientes`)
      .send({ name: "Paciente Teste", bornDate: "10/10/1990", professionalId: "prof-1" });

    expect(response.status).toBe(200);
  });

  it("deve retornar 400 quando campos obrigatórios faltarem", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/pacientes`)
      .send({ name: "Paciente Teste" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 400 quando nome for curto", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/pacientes`)
      .send({ name: "AB", bornDate: "1990-10-10", professionalId: "prof-1" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 400 quando data for inválida", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/pacientes`)
      .send({ name: "Paciente Teste", bornDate: "data-invalida", professionalId: "prof-1" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/data de nascimento inválida/);
  });

  it("deve retornar 400 quando profissional não existir", async () => {
    mockProfessionalFindById.mockResolvedValueOnce(null);

    const response = await supertest(app)
      .post(`${BASE_URL}/pacientes`)
      .send({ name: "Paciente Teste", bornDate: "1990-10-10", professionalId: "prof-1" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/profissional informado não existe/);
  });

  it("deve retornar 400 quando service lançar erro", async () => {
    mockProfessionalFindById.mockResolvedValueOnce({ id: "prof-1" });
    mockPatientCreate.mockRejectedValueOnce(new Error("db error"));

    const response = await supertest(app)
      .post(`${BASE_URL}/pacientes`)
      .send({ name: "Paciente Teste", bornDate: "1990-10-10", professionalId: "prof-1" });

    expect(response.status).toBe(400);
  });
});

describe("GET /pacientes", () => {
  it("deve listar pacientes e retornar 200", async () => {
    mockPatientList.mockResolvedValueOnce([fakePatient]);

    const response = await supertest(app).get(`${BASE_URL}/pacientes`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("deve retornar 503 quando service lançar erro", async () => {
    mockPatientList.mockRejectedValueOnce(new Error("db error"));

    const response = await supertest(app).get(`${BASE_URL}/pacientes`);

    expect(response.status).toBe(503);
  });
});

describe("GET /pacientes/:patientId", () => {
  it("deve retornar paciente por id com status 200", async () => {
    mockPatientFindById.mockResolvedValueOnce(fakePatient);

    const response = await supertest(app).get(`${BASE_URL}/pacientes/uuid-789`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: "uuid-789" });
  });

  it("deve retornar 400 quando id não existir", async () => {
    mockPatientFindById.mockResolvedValueOnce(null);

    const response = await supertest(app).get(`${BASE_URL}/pacientes/inexistente`);

    expect(response.status).toBe(400);
  });

  it("deve retornar 503 quando service lançar erro", async () => {
    mockPatientFindById.mockRejectedValueOnce(new Error("db error"));

    const response = await supertest(app).get(`${BASE_URL}/pacientes/uuid-789`);

    expect(response.status).toBe(503);
  });
});

describe("PATCH /pacientes/:patientId", () => {
  it("deve atualizar paciente e retornar 200", async () => {
    const updated = { ...fakePatient, name: "Paciente Atualizado" };
    mockProfessionalFindById.mockResolvedValueOnce({ id: "prof-1" });
    mockPatientFindById.mockResolvedValueOnce(fakePatient);
    mockPatientUpdate.mockResolvedValueOnce(updated);

    const response = await supertest(app)
      .patch(`${BASE_URL}/pacientes/uuid-789`)
      .send({ name: "Paciente Atualizado", bornDate: "1990-10-10", professionalId: "prof-1" });

    expect(response.status).toBe(200);
  });

  it("deve aceitar bornDate no formato BR (DD/MM/AAAA) no update", async () => {
    const updated = { ...fakePatient, name: "Paciente Atualizado" };
    mockProfessionalFindById.mockResolvedValueOnce({ id: "prof-1" });
    mockPatientFindById.mockResolvedValueOnce(fakePatient);
    mockPatientUpdate.mockResolvedValueOnce(updated);

    const response = await supertest(app)
      .patch(`${BASE_URL}/pacientes/uuid-789`)
      .send({ name: "Paciente Atualizado", bornDate: "10/10/1990", professionalId: "prof-1" });

    expect(response.status).toBe(200);
  });

  it("deve retornar 400 quando data for inválida", async () => {
    const response = await supertest(app)
      .patch(`${BASE_URL}/pacientes/uuid-789`)
      .send({ name: "Paciente Teste", bornDate: "xx", professionalId: "prof-1" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 400 quando profissional não existir", async () => {
    mockProfessionalFindById.mockResolvedValueOnce(null);

    const response = await supertest(app)
      .patch(`${BASE_URL}/pacientes/uuid-789`)
      .send({ name: "Paciente Teste", bornDate: "1990-10-10", professionalId: "prof-1" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 400 quando paciente não existir", async () => {
    mockProfessionalFindById.mockResolvedValueOnce({ id: "prof-1" });
    mockPatientFindById.mockResolvedValueOnce(null);

    const response = await supertest(app)
      .patch(`${BASE_URL}/pacientes/uuid-789`)
      .send({ name: "Paciente Teste", bornDate: "1990-10-10", professionalId: "prof-1" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 503 quando service lançar erro", async () => {
    mockProfessionalFindById.mockRejectedValueOnce(new Error("db error"));

    const response = await supertest(app)
      .patch(`${BASE_URL}/pacientes/uuid-789`)
      .send({ name: "Paciente Teste", bornDate: "1990-10-10", professionalId: "prof-1" });

    expect(response.status).toBe(503);
  });
});

describe("PATCH /pacientes/status/:patientId", () => {
  it("deve atualizar status e retornar 200", async () => {
    mockPatientFindById.mockResolvedValueOnce(fakePatient);
    mockPatientUpdateStatus.mockResolvedValueOnce({ ...fakePatient, status: false });

    const response = await supertest(app)
      .patch(`${BASE_URL}/pacientes/status/uuid-789`)
      .send({ status: false });

    expect(response.status).toBe(200);
  });

  it("deve retornar 400 quando status não for booleano", async () => {
    const response = await supertest(app)
      .patch(`${BASE_URL}/pacientes/status/uuid-789`)
      .send({ status: "invalido" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 400 quando paciente não existir", async () => {
    mockPatientFindById.mockResolvedValueOnce(null);

    const response = await supertest(app)
      .patch(`${BASE_URL}/pacientes/status/uuid-789`)
      .send({ status: true });

    expect(response.status).toBe(400);
  });

  it("deve retornar 503 quando service lançar erro", async () => {
    mockPatientFindById.mockRejectedValueOnce(new Error("db error"));

    const response = await supertest(app)
      .patch(`${BASE_URL}/pacientes/status/uuid-789`)
      .send({ status: true });

    expect(response.status).toBe(503);
  });
});
