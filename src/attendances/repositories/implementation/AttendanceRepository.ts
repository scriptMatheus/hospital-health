/* eslint-disable no-unused-expressions */
import { DataSource, Repository } from "typeorm";
import { Attendance } from "../../entities/Attendance";
import { IAttendanceRepository } from "../IAttendanceRepository";

class AttendanceRepository implements IAttendanceRepository {
    //@ts-ignore
    private attendanceRepository: Repository<Attendance>;

    async list(conSource:DataSource): Promise<Attendance[]> {
        this.attendanceRepository = conSource.getRepository(Attendance);
        const attendances = await this.attendanceRepository.find({
        })
        await conSource.destroy();

        return attendances;
    }

    async findById(attendanceId: string, conSource:DataSource): Promise<Attendance|null> {
        this.attendanceRepository = conSource.getRepository(Attendance);
        const attendance = await this.attendanceRepository.findOneBy({
            id: attendanceId,
        }) 

        await conSource.destroy();
        return attendance;
    }

    async save(attendance: Attendance, conSource:DataSource): Promise<Attendance|string> {
        this.attendanceRepository = conSource.getRepository(Attendance);

        const newAttendance = await this.attendanceRepository.save(attendance);

        await conSource.destroy();
        return newAttendance;
    }


    async update(attendance: Attendance, attendanceId: string, conSource:DataSource): Promise<Attendance | null> {
        this.attendanceRepository = conSource.getRepository(Attendance);
        await this.attendanceRepository.update(attendanceId, attendance);

        //retorna atualizado
        const attendanceUpdated = await this.findById(attendanceId, conSource);
        await conSource.destroy();

        return attendanceUpdated;
    }

    async updateStatus(attendanceId: string, status: number, conSource:DataSource): Promise<Attendance | null> {
        this.attendanceRepository = conSource.getRepository(Attendance);
        await this.attendanceRepository.update(attendanceId, { status });

        //retorna atualizado
        const attendanceUpdated = await this.findById(attendanceId, conSource);
        await conSource.destroy();
        return attendanceUpdated;

    }
}

export { AttendanceRepository };