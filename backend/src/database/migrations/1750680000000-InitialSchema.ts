import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1750680000000 implements MigrationInterface {
  name = 'InitialSchema1750680000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasUsers = await queryRunner.hasTable('users');
    if (hasUsers) {
      return;
    }

    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'employee')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employees_employment_type_enum" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employees_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'ONBOARDING', 'TERMINATED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employee_documents_document_type_enum" AS ENUM('NIC_ID_COPY', 'PASSPORT_COPY', 'CV_RESUME', 'EDUCATION_CERTIFICATE', 'PREVIOUS_EMPLOYMENT_LETTER', 'BANK_DETAILS', 'SIGNED_CONTRACT', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payrolls_payment_status_enum" AS ENUM('PENDING', 'PAID', 'FAILED')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "name" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'employee',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "departments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_departments" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "positions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "department_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_positions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_positions_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "employees" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "employee_code" character varying NOT NULL,
        "first_name" character varying NOT NULL,
        "last_name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying,
        "address" text,
        "department_id" uuid NOT NULL,
        "position_id" uuid NOT NULL,
        "joining_date" date NOT NULL,
        "employment_type" "public"."employees_employment_type_enum" NOT NULL DEFAULT 'FULL_TIME',
        "basic_salary" numeric(12,2) NOT NULL DEFAULT 0,
        "status" "public"."employees_status_enum" NOT NULL DEFAULT 'ONBOARDING',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_employees_employee_code" UNIQUE ("employee_code"),
        CONSTRAINT "UQ_employees_email" UNIQUE ("email"),
        CONSTRAINT "PK_employees" PRIMARY KEY ("id"),
        CONSTRAINT "FK_employees_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id"),
        CONSTRAINT "FK_employees_position" FOREIGN KEY ("position_id") REFERENCES "positions"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "employee_documents" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "employee_id" uuid NOT NULL,
        "document_type" "public"."employee_documents_document_type_enum" NOT NULL DEFAULT 'OTHER',
        "original_file_name" character varying NOT NULL,
        "stored_file_name" character varying NOT NULL,
        "file_path" character varying NOT NULL,
        "file_size" integer NOT NULL,
        "mime_type" character varying NOT NULL,
        "uploaded_by" character varying NOT NULL,
        "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_employee_documents" PRIMARY KEY ("id"),
        CONSTRAINT "FK_employee_documents_employee" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "payrolls" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "employee_id" uuid NOT NULL,
        "month" integer NOT NULL,
        "year" integer NOT NULL,
        "basic_salary" numeric(12,2) NOT NULL DEFAULT 0,
        "allowances" numeric(12,2) NOT NULL DEFAULT 0,
        "deductions" numeric(12,2) NOT NULL DEFAULT 0,
        "net_salary" numeric(12,2) NOT NULL DEFAULT 0,
        "payment_status" "public"."payrolls_payment_status_enum" NOT NULL DEFAULT 'PENDING',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payrolls" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_payrolls_employee_period" UNIQUE ("employee_id", "month", "year"),
        CONSTRAINT "FK_payrolls_employee" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payrolls"`);
    await queryRunner.query(`DROP TABLE "employee_documents"`);
    await queryRunner.query(`DROP TABLE "employees"`);
    await queryRunner.query(`DROP TABLE "positions"`);
    await queryRunner.query(`DROP TABLE "departments"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."payrolls_payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."employee_documents_document_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."employees_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."employees_employment_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
