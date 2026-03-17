import { DataSource } from "typeorm";
import { Attendance } from "../entities/Attendance";

interface IAttendanceRepository {
    save(attendance: Attendance, conSource:DataSource): Promise<Attendance|string>;
    findById(attendanceId: string, conSource:DataSource): Promise<Attendance|null>;
    list(conSource:DataSource): Promise<Attendance[]>;
    update(attendance: Attendance, attendanceId: string, conSource:DataSource): Promise<Attendance | null>;
    updateStatus(attendanceId: string, status: number, conSource:DataSource): Promise<Attendance | null>;
}

export { IAttendanceRepository };
