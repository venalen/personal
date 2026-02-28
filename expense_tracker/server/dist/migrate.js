"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = migrate;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./db"));
async function migrate() {
    const schemaPath = path_1.default.join(__dirname, 'schema.sql');
    // In dev (tsx), __dirname points to src/. In prod (compiled), it points to dist/.
    // Try src/ first, fall back to looking relative to the project root.
    let sql;
    if (fs_1.default.existsSync(schemaPath)) {
        sql = fs_1.default.readFileSync(schemaPath, 'utf-8');
    }
    else {
        const fallback = path_1.default.join(__dirname, '..', 'src', 'schema.sql');
        sql = fs_1.default.readFileSync(fallback, 'utf-8');
    }
    await db_1.default.query(sql);
    console.log('Database migration complete');
}
