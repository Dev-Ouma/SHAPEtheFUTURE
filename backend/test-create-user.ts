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
  try {
    const user = repo.create({
      email: "test_staff_creation3@ouk.ac.ke",
      username: "test_staff_creation3",
      password: await bcrypt.hash("123456", 10),
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
