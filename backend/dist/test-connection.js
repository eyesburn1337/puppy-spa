"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const mikro_orm_config_1 = require("./mikro-orm.config");
(async () => {
    try {
        const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
        console.log('Connected to database successfully!');
        const connection = orm.em.getConnection();
        const result = await connection.execute('SELECT 1');
        console.log('Query result:', result);
        await orm.close();
        process.exit(0);
    }
    catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
})();
//# sourceMappingURL=test-connection.js.map