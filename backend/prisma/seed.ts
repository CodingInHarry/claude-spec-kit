import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PREDEFINED_USERS = [
  { id: "u-pm", name: "김지현 (PM)", role: "PM" as const },
  { id: "u-eng-1", name: "이서준", role: "Engineer" as const },
  { id: "u-eng-2", name: "박민아", role: "Engineer" as const },
  { id: "u-eng-3", name: "최도윤", role: "Engineer" as const },
  { id: "u-eng-4", name: "정하은", role: "Engineer" as const },
];

async function main() {
  for (const user of PREDEFINED_USERS) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { name: user.name, role: user.role },
      create: user,
    });
  }
  console.log(`시드 완료: ${PREDEFINED_USERS.length}명의 사용자 등록됨`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
