import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

const seedSuperAdmin = async () => {
  const name = process.env.SUPER_ADMIN_NAME;
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required in .env"
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser && existingUser.role !== "SUPER_ADMIN") {
    throw new Error(
      "This email already belongs to a non-admin user. Use a different email."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        passwordHash,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });

    console.log("Super Admin updated successfully.");
  } else {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });

    console.log("Super Admin created successfully.");
  }
};

seedSuperAdmin()
  .catch((error) => {
    console.error("Failed to seed Super Admin:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });