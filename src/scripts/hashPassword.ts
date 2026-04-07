import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/db";
import { Admin } from "../entities/Admin";

const hashExistingPasswords = async () => {
  await AppDataSource.initialize();
  const adminRepo = AppDataSource.getRepository(Admin);

  const admins = await adminRepo.find({
    select: ["id", "password_hash"],
  });

  for (const admin of admins) {
    // Skip if already hashed
    if (admin.password_hash.startsWith("$2")) {
      console.log(`Admin ${admin.id} already hashed, skipping.`);
      continue;
    }

    const salt = await bcrypt.genSalt(10);
    admin.password_hash = await bcrypt.hash(admin.password_hash, salt);
    await adminRepo.save(admin);
    console.log(`Admin ${admin.id} password hashed successfully.`);
  }

  await AppDataSource.destroy();
  console.log("Done.");
};

hashExistingPasswords();
