"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppy_entity_1 = require("./domain/entities/puppy.entity");
const waiting_list_entity_1 = require("./domain/entities/waiting-list.entity");
const config = {
    entities: [puppy_entity_1.Puppy, waiting_list_entity_1.WaitingList],
    dbName: 'puppy_spa',
    type: 'postgresql',
    clientUrl: process.env.DATABASE_URL,
    migrations: {
        path: 'dist/migrations',
        pathTs: 'src/migrations',
    },
};
exports.default = config;
//# sourceMappingURL=mikro-orm.config.js.map