"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppy_entity_1 = require("./core/domain/entities/puppy.entity");
const waiting_list_entity_1 = require("./core/domain/entities/waiting-list.entity");
const config = {
    entities: [puppy_entity_1.Puppy, waiting_list_entity_1.WaitingList],
    dbName: 'puppy_spa',
    type: 'postgresql',
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    debug: true,
    migrations: {
        path: './dist/migrations',
        pathTs: './src/migrations',
        disableForeignKeys: false,
        safe: true,
        allOrNothing: true,
        transactional: true,
    },
    discovery: {
        warnWhenNoEntities: true,
        requireEntitiesArray: true,
    },
    allowGlobalContext: true
};
exports.default = config;
//# sourceMappingURL=mikro-orm.config.js.map