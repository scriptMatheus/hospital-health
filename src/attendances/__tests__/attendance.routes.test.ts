process.env.TOKEN_SECRET = "test-secret";

import "reflect-metadata";
import express from "express";
import supertest from "supertest";

jest.mock("../../utils/authenticateRequest", () => ({
  generateToken: () => "fake-token",
  authenticateRequest: (_req: any, _res: any, next: any) => next(),
}));

const mockAttendanceList = jest.fn();
const mockAttendanceFindById = jest.fn();
const mockAttendanceCreate = jest.fn();
const mockAttendanceUpdate = jest.fn();
const mockAttendanceUpdateStatus = jest.fn();

jest.mock("../services/AttendanceService", () => ({
  AttendanceService: jest.fn().mockImplementation(() => ({
    list: mockAttendanceList,
    findById: mockAttendanceFindById,
    createAttendance: mockAttendanceCreate,
    update: mockAttendanceUpdate,
    updateStatus: mockAttendanceUpdateStatus,
  })),
}));

const mockPatientFindById = jest.fn();
jest.mock("../../patients/services/PatientService", () => ({
  PatientService: jest.fn().mockImplementation(() => ({
    findById: mockPatientFindById,
  })),
}));

const mockProfessionalFindById = jest.fn();
jest.mock("../../professionals/services/ProfessionalService", () => ({
  ProfessionalService: jest.fn().mockImplementation(() => ({
    findById: mockProfessionalFindById,
  })),
}));

import { attendanceRoutes } from "../../routes/attendance.routes";

const BASE_URL = "/api";

const app = express();
app.use(express.json());
app.use(`${BASE_URL}/atendimentos`, attendanceRoutes);

const fakeAttendance = {
  id: "attendance-1",
  patientId: "patient-1",
  professionalId: "prof-1",
  attendanceDate: "2099-12-30",
  attendanceTime: "20:30",
  description: "Consulta de rotina",
  status: true,
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /atendimentos", () => {
  it("deve criar atendimento e retornar 200", async () => {
    mockPatientFindById.mockResolvedValueOnce({ id: "patient-1" });
    mockProfessionalFindById.mockResolvedValueOnce({ id: "prof-1" });
    mockAttendanceCreate.mockResolvedValueOnce(fakeAttendance);

    const response = await supertest(app)
      .post(`${BASE_URL}/atendimentos`)
      .send({ patientId: "patient-1", professionalId: "prof-1", attendanceDate: "30/12/2099", attendanceTime: "20:30", description: "Consulta de rotina" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: "attendance-1" });
  });

  it("deve retornar 400 quando campos obrigatórios faltarem", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/atendimentos`)
      .send({ patientId: "patient-1" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 400 quando hora estiver em formato inválido", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/atendimentos`)
      .send({ patientId: "patient-1", professionalId: "prof-1", attendanceDate: "30/12/2099", attendanceTime: "25:99" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/hora do atendimento inválida/);
  });

  it("deve retornar 400 quando data estiver em formato inválido", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/atendimentos`)
      .send({ patientId: "patient-1", professionalId: "prof-1", attendanceDate: "99/99/9999", attendanceTime: "20:30" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/data do atendimento inválida/);
  });

  it("deve retornar 400 quando data e hora não forem futuras", async () => {
    const response = await supertest(app)
      .post(`${BASE_URL}/atendimentos`)
      .send({ patientId: "patient-1", professionalId: "prof-1", attendanceDate: "01/01/2020", attendanceTime: "10:00" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/devem ser futuras/);
  });

  it("deve retornar 400 quando paciente não existir", async () => {
    mockPatientFindById.mockResolvedValueOnce(null);

    const response = await supertest(app)
      .post(`${BASE_URL}/atendimentos`)
      .send({ patientId: "patient-1", professionalId: "prof-1", attendanceDate: "30/12/2099", attendanceTime: "20:30" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 400 quando profissional não existir", async () => {
    mockPatientFindById.mockResolvedValueOnce({ id: "patient-1" });
    mockProfessionalFindById.mockResolvedValueOnce(null);

    const response = await supertest(app)
      .post(`${BASE_URL}/atendimentos`)
      .send({ patientId: "patient-1", professionalId: "prof-1", attendanceDate: "30/12/2099", attendanceTime: "20:30" });

    expect(response.status).toBe(400);
  });
});

describe("GET /atendimentos", () => {
  it("deve listar atendimentos e retornar 200", async () => {
    mockAttendanceList.mockResolvedValueOnce([fakeAttendance]);

    const response = await supertest(app).get(`${BASE_URL}/atendimentos`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("deve retornar 503 quando service lançar erro", async () => {
    mockAttendanceList.mockRejectedValueOnce(new Error("db error"));

    const response = await supertest(app).get(`${BASE_URL}/atendimentos`);

    expect(response.status).toBe(503);
  });
});

describe("GET /atendimentos/:attendanceId", () => {
  it("deve retornar atendimento por id com status 200", async () => {
    mockAttendanceFindById.mockResolvedValueOnce(fakeAttendance);

    const response = await supertest(app).get(`${BASE_URL}/atendimentos/attendance-1`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: "attendance-1" });
  });

  it("deve retornar 400 quando id não existir", async () => {
    mockAttendanceFindById.mockResolvedValueOnce(null);

    const response = await supertest(app).get(`${BASE_URL}/atendimentos/inexistente`);

    expect(response.status).toBe(400);
  });
});

describe("PATCH /atendimentos/:attendanceId", () => {
  it("deve atualizar atendimento e retornar 200", async () => {
    mockPatientFindById.mockResolvedValueOnce({ id: "patient-1" });
    mockProfessionalFindById.mockResolvedValueOnce({ id: "prof-1" });
    mockAttendanceFindById.mockResolvedValueOnce(fakeAttendance);
    mockAttendanceUpdate.mockResolvedValueOnce(fakeAttendance);

    const response = await supertest(app)
      .patch(`${BASE_URL}/atendimentos/attendance-1`)
      .send({ patientId: "patient-1", professionalId: "prof-1", attendanceDate: "30/12/2099", attendanceTime: "20:30", description: "Retorno" });

    expect(response.status).toBe(200);
  });

  it("deve retornar 400 quando data e hora não forem futuras", async () => {
    const response = await supertest(app)
      .patch(`${BASE_URL}/atendimentos/attendance-1`)
      .send({ patientId: "patient-1", professionalId: "prof-1", attendanceDate: "01/01/2020", attendanceTime: "10:00" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 400 quando paciente não existir", async () => {
    mockPatientFindById.mockResolvedValueOnce(null);

    const response = await supertest(app)
      .patch(`${BASE_URL}/atendimentos/attendance-1`)
      .send({ patientId: "patient-1", professionalId: "prof-1", attendanceDate: "30/12/2099", attendanceTime: "20:30" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 400 quando profissional não existir", async () => {
    mockPatientFindById.mockResolvedValueOnce({ id: "patient-1" });
    mockProfessionalFindById.mockResolvedValueOnce(null);

    const response = await supertest(app)
      .patch(`${BASE_URL}/atendimentos/attendance-1`)
      .send({ patientId: "patient-1", professionalId: "prof-1", attendanceDate: "30/12/2099", attendanceTime: "20:30" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 400 quando atendimento não existir", async () => {
    mockPatientFindById.mockResolvedValueOnce({ id: "patient-1" });
    mockProfessionalFindById.mockResolvedValueOnce({ id: "prof-1" });
    mockAttendanceFindById.mockResolvedValueOnce(null);

    const response = await supertest(app)
      .patch(`${BASE_URL}/atendimentos/attendance-1`)
      .send({ patientId: "patient-1", professionalId: "prof-1", attendanceDate: "30/12/2099", attendanceTime: "20:30" });

    expect(response.status).toBe(400);
  });
});

describe("PATCH /atendimentos/status/:attendanceId", () => {
  it("deve atualizar status e retornar 200", async () => {
    mockAttendanceFindById.mockResolvedValueOnce(fakeAttendance);
    mockAttendanceUpdateStatus.mockResolvedValueOnce({ ...fakeAttendance, status: false });

    const response = await supertest(app)
      .patch(`${BASE_URL}/atendimentos/status/attendance-1`)
      .send({ status: false });

    expect(response.status).toBe(200);
  });

  it("deve retornar 400 quando status não for booleano", async () => {
    const response = await supertest(app)
      .patch(`${BASE_URL}/atendimentos/status/attendance-1`)
      .send({ status: "invalido" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 400 quando atendimento não existir", async () => {
    mockAttendanceFindById.mockResolvedValueOnce(null);

    const response = await supertest(app)
      .patch(`${BASE_URL}/atendimentos/status/attendance-1`)
      .send({ status: true });

    expect(response.status).toBe(400);
  });
});
