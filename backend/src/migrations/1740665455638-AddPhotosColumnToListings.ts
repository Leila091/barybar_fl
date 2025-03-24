import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhotosColumnToListings1740665455638 {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE listings ADD COLUMN photos TEXT`);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE listings DROP COLUMN photos`);
    }
}