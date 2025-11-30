import { PrismaClient } from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL || "",
});
const Prisma = new PrismaClient({ adapter });

export default Prisma;
