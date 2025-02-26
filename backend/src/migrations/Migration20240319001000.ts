import { Migration } from '@mikro-orm/migrations';

export class Migration20240319001000 extends Migration {
  async up(): Promise<void> {
    // Drop existing tables if they exist
    this.addSql('DROP TABLE IF EXISTS "puppies" CASCADE;');
    this.addSql('DROP TABLE IF EXISTS "waiting_lists" CASCADE;');

    // Enable uuid-ossp extension
    this.addSql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Create waiting_lists table
    this.addSql(`
      CREATE TABLE "waiting_lists" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "date" timestamp NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        CONSTRAINT "waiting_lists_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create puppies table
    this.addSql(`
      CREATE TABLE "puppies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "pet_name" varchar(255) NOT NULL,
        "customer_name" varchar(255) NOT NULL,
        "service" varchar(255) NOT NULL,
        "appointment_time" timestamp NOT NULL,
        "is_serviced" boolean NOT NULL DEFAULT false,
        "order_index" integer NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "waiting_list_id" uuid NOT NULL,
        "status" varchar(255) NOT NULL DEFAULT 'Pending',
        CONSTRAINT "puppies_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "puppies_waiting_list_id_foreign" FOREIGN KEY ("waiting_list_id") 
          REFERENCES "waiting_lists" ("id") ON DELETE CASCADE
      );
    `);

    // Create indexes
    this.addSql('CREATE INDEX "puppies_waiting_list_id_index" ON "puppies" ("waiting_list_id");');
    this.addSql('CREATE INDEX "puppies_appointment_time_index" ON "puppies" ("appointment_time");');
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "puppies" CASCADE;');
    this.addSql('DROP TABLE IF EXISTS "waiting_lists" CASCADE;');
    this.addSql('DROP EXTENSION IF EXISTS "uuid-ossp";');
  }
} 