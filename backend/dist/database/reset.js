"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const mikro_orm_config_1 = require("../mikro-orm.config");
async function resetDatabase() {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    const generator = orm.getSchemaGenerator();
    try {
        await generator.dropSchema();
        console.log('Schema dropped');
        await generator.createSchema();
        console.log('Schema created');
        await generator.updateSchema();
        console.log('Schema updated');
        await orm.close(true);
        console.log('Database reset complete');
    }
    catch (error) {
        console.error('Error resetting database:', error);
        await orm.close(true);
        process.exit(1);
    }
}
resetDatabase();
//# sourceMappingURL=reset.js.map