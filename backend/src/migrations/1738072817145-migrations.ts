import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1738072817145 implements MigrationInterface {
    name = 'Migrations1738072817145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subtask" (
            "id" SERIAL NOT NULL, 
            "title" character varying NOT NULL, 
            "status" character varying NOT NULL DEFAULT 'pending', 
            "priority" character varying NOT NULL DEFAULT 'medium', 
            "due_date" TIMESTAMP NOT NULL DEFAULT now(), 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "taskId" integer, 
            CONSTRAINT "PK_e0cda44ad38dba885bd8ab1afd3" PRIMARY KEY ("id")
        )`);
        
        await queryRunner.query(`CREATE TABLE "file" (
            "id" SERIAL NOT NULL, 
            "file_url" character varying NOT NULL, 
            "file_type" character varying NOT NULL, 
            "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "public_id" character varying NOT NULL, 
            "taskId" integer, 
            CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id")
        )`);
        
        await queryRunner.query(`CREATE TABLE "task" (
            "id" SERIAL NOT NULL, 
            "title" character varying NOT NULL, 
            "description" text, 
            "status" character varying NOT NULL DEFAULT 'pending', 
            "priority" character varying NOT NULL DEFAULT 'medium', 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "due_date" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id")
        )`);
        
        await queryRunner.query(`ALTER TABLE "subtask" ADD CONSTRAINT "FK_8209040ec2c518c62c70cd382dd" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_e0479c7972553f7b6e78361e931" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_e0479c7972553f7b6e78361e931"`);
        await queryRunner.query(`ALTER TABLE "subtask" DROP CONSTRAINT "FK_8209040ec2c518c62c70cd382dd"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TABLE "file"`);
        await queryRunner.query(`DROP TABLE "subtask"`);
    }
}