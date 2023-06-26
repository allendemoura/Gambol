// SOOT
// DOES NOT WORK

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// use `prisma` in your application to read and write data in your DB

const boys = await prisma.boy.createMany({
  data: [
    {
      name: "Tebbo",
      role: "MAN",
    },
    {
      name: "Alleb",
      role: "MAN",
    },
    {
      name: "Lembo",
      role: "SHIPLET",
    },
  ],
});

console.log(boys);
