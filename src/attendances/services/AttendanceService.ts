import { inject, injectable } from "tsyringe";
import { DataSource } from "typeorm";
import { IAttendanceRepository } from "../repositories/IAttendanceRepository";
import { IAttendanceDTO } from "../interfaces/IAttendanceDTO";
import { Attendance } from "../entities/Attendance";
import { AppError } from "../../shared/errors/AppError";

@injectable()
class AttendanceService {
  constructor(
    //@ts-ignore
    @inject("AttendanceRepository")
    private attendanceRepository: IAttendanceRepository
  ) {}

  async list(req: any): Promise<Attendance[]> {
    const prmNewCon = await this.defineConnection(req);
    return this.attendanceRepository.list(prmNewCon);
  }

  async findById(attendanceId: string, req: any): Promise<Attendance | null> {
    const prmNewCon = await this.defineConnection(req);
    return this.attendanceRepository.findById(attendanceId, prmNewCon);
  }

  async findByProfessionalAndDateTime(
    professionalId: string,
    attendanceDate: string,
    attendanceTime: string,
    excludeAttendanceId: string | null,
    req: any
  ): Promise<Attendance | null> {
    const prmNewCon = await this.defineConnection(req);
    return this.attendanceRepository.findByProfessionalAndDateTime(
      professionalId, attendanceDate, attendanceTime, excludeAttendanceId, prmNewCon
    );
  }

  async createAttendance(dto: IAttendanceDTO, req: any): Promise<Attendance | string> {
    const prmNewCon = await this.defineConnection(req);

    const attendance = new Attendance();
    attendance.patientId = dto.patientId;
    attendance.professionalId = dto.professionalId;
    attendance.attendanceDate = new Date(`${dto.attendanceDate}T00:00:00`);
    attendance.attendanceTime = dto.attendanceTime;
    attendance.description = dto.description;
    attendance.status = dto.status;

    try {
      return await this.attendanceRepository.save(attendance, prmNewCon);
    } catch (error) {
      throw new AppError("Erro ao criar atendimento", 400);
    }
  }

  async update(dto: IAttendanceDTO, attendanceId: string, req: any): Promise<Attendance | null> {
    const prmNewCon = await this.defineConnection(req);

    const attendance = new Attendance();
    attendance.patientId = dto.patientId;
    attendance.professionalId = dto.professionalId;
    attendance.attendanceDate = new Date(`${dto.attendanceDate}T00:00:00`);
    attendance.attendanceTime = dto.attendanceTime;
    attendance.description = dto.description;
    attendance.status = dto.status;

    return this.attendanceRepository.update(attendance, attendanceId, prmNewCon);
  }

  async updateStatus(attendanceId: string, status: number, req: any): Promise<Attendance | null> {
    const prmNewCon = await this.defineConnection(req);
    return this.attendanceRepository.updateStatus(attendanceId, status, prmNewCon);
  }

  async defineConnection(req: any): Promise<DataSource> {
    const customDataSource = new DataSource({
      type: "mysql",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ["./src/**/entities/*.ts"],
      charset: process.env.DB_CHARSET,
      logging: process.env.DB_LOGGING === "true",
      synchronize: process.env.DB_SYNCHRONIZE === "true",
    });

    try {
      await customDataSource.initialize();
      return customDataSource;
    } catch (err) {
      console.error("Problema ao inicializar o Data Source:", err);
      throw new AppError("Falha ao conectar com o banco de dados", 503);
    }
  }
}

export { AttendanceService };
