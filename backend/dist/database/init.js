"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const mikro_orm_config_1 = __importDefault(require("../mikro-orm.config"));
async function init() {
    try {
        const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
        const generator = orm.getSchemaGenerator();
        await generator.dropSchema();
        await generator.createSchema();
        console.log('Schema created successfully');
        const queries = await generator.getCreateSchemaSQL();
        console.log('Database queries to be executed:', queries);
        await orm.close();
        console.log('Database initialization completed');
    }
    catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}
init();
//# sourceMappingURL=init.js.map