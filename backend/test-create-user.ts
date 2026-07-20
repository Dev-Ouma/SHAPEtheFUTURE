import { DataSource } from "typeorm";
import { User } from "./src/auth/entities/user.entity";
import * as bcrypt from 'bcrypt';

async function run() {
  const AppDataSource = new DataSource({
    type: "postgres",
    url: "postgres://mwarabu@localhost:5432/ouk_db",
    entities: ["src/**/*.entity.ts"],
    synchronize: false,
  });

  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(User);
  const testPassword = process.env.SEED_TEST_PASSWORD;
  if (!testPassword || testPassword.length < 10) {
    throw new Error("Set SEED_TEST_PASSWORD (min 10 chars). Do not hardcode passwords.");
  }
  try {
    const user = repo.create({
      email: "test_staff_creation3@ouk.ac.ke",
      username: "test_staff_creation3",
      password: await bcrypt.hash(testPassword, 10),
      full_name: "Test Staff",
      role_legacy: "viewer" as any,
      user_type: "staff" as any,
      department: "Test Dept",
      school: "Test School",
      account_status: "active" as any,
    });
    console.log("Saving user...");
    const res = await repo.save(user);
    console.log("Success:", res.id);
  } catch (err: any) {
    console.error("Save Error:", err.message);
  }
  process.exit(0);
}
run();
