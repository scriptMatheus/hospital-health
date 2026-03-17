import crypto from "crypto";
import multer from "multer";
import { resolve } from "path";

import { AppError } from "../errors/AppError";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const TMP_FOLDER = resolve(__dirname, "..", "..", "tmp");

export default {
    TMP_FOLDER,
    storage: multer.diskStorage({
        destination: TMP_FOLDER,
        filename: (req, file, cb) => {
            const fileHash = crypto.randomBytes(16).toString("hex");
            const fileName = `${fileHash}-${file.originalname}`;
            return cb(null, fileName);
        },
    }),
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            cb(null, true);
        } else {
            cb(new AppError("Formato de arquivo não permitido!", 400));
        }
    },
};
