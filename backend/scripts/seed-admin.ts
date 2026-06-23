import { readFileSync } from 'fs';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../src/users/user.entity';
import { UserRole } from '../src/users/user-role.enum';

function loadEnv() {
  const envPath = resolve(__dirname, '../.env');
  const content = readFileSync(envPath, 'utf8');

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    process.env[key] = value;
  }
}

loadEnv();

const ADMIN_EMAIL = 'admin@hrsystem.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'System Admin';

async function seedAdmin() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User],
    ssl: { rejectUnauthorized: false },
  });

  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    existing.role = UserRole.ADMIN;
    existing.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
    existing.name = ADMIN_NAME;
    await userRepo.save(existing);
    console.log('Updated existing user to admin:', ADMIN_EMAIL);
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = userRepo.create({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      role: UserRole.ADMIN,
    });
    await userRepo.save(admin);
    console.log('Created admin user:', ADMIN_EMAIL);
  }

  await dataSource.destroy();
}

seedAdmin().catch((error) => {
  console.error('Failed to seed admin:', error);
  process.exit(1);
});
