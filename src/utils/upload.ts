import crypto from "crypto";
import multer from "multer";
import { resolve } from "path";

import { AppError } from "../shared/errors/AppError";

const MAX_SIZE_TWENTY_MEGABYTES = 20 * 1024 * 1024;

const ALLOWED_FILE_TYPES= [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/x-x509-ca-cert",
    "application/x-pkcs12",
    "application/x-pem-file",

];

const TMP_FOLDER = resolve(__dirname, "..", "tmp");

export default {
    TMP_FOLDER,
    storage: multer.diskStorage({
        destination: TMP_FOLDER,
        filename: (req, file, cb) => {
            const extFile = file.originalname.split(".")[1];
            const fileHash = crypto.randomBytes(16).toString("hex");
            const fileName = `${fileHash}.${extFile}`;
            return cb(null, fileName);
        },
    }),
    limits: {
        fileSize: MAX_SIZE_TWENTY_MEGABYTES,
    },
    fileFilter: (req, file, cb) => {
        const allowedMines = ALLOWED_FILE_TYPES;
        if (allowedMines.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError("Formato de arquivo não permitido!", 400));
        }
    },
};
