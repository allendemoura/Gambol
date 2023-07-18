const { users } = require("@clerk/clerk-sdk-node");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// use `prisma` in your application to read and write data in your DB

async function main() {
  const users = await prisma.user.createMany({
    data: [
      {
        firstName: "Jimmy",
        lastName: "Nelson",
        id: "1",
      },
      {
        firstName: "Bobby",
        lastName: "Nelson",
        id: "2",
      },
      {
        firstName: "Timmy",
        lastName: "Nelson",
        id: "3",
      },
      {
        firstName: "Tony",
        lastName: "Nelson",
        id: "4",
      },
      {
        firstName: "Henrald",
        lastName: "Nanciette",
        id: "5",
      },
      {
        firstName: "Gordon",
        lastName: "Lightfoot",
        id: "6",
      },
    ],
  });
  console.log("users created: ", users);

  const pools = await prisma.pool.createMany({
    data: [
      {
        desc: "Years until UFOs proven real",
        point: 10.5,
        underPool: 10,
        overPool: 18,
      },
      {
        desc: "Dollars in PT's average poker pot",
        point: 100.5,
        underPool: 10,
        overPool: 18,
      },
      {
        desc: "Years until the world ends",
        point: 1000.5,
        underPool: 10,
        overPool: 18,
      },
      {
        desc: "Dollar amount of Saf's first Texas settlement",
        point: 10000.5,
        underPool: 10,
        overPool: 18,
      },
    ],
  });
  console.log("pools created: ", pools);

  const bets = await prisma.bet.createMany({
    data: [
      {
        betterID: "1",
        bet: "OVER",
        poolID: 1,
        amount: 10,
      },
      {
        betterID: "2",
        bet: "UNDER",
        poolID: 1,
        amount: 5,
      },
      {
        betterID: "3",
        bet: "OVER",
        poolID: 1,
        amount: 7,
      },
      {
        betterID: "4",
        bet: "UNDER",
        poolID: 1,
        amount: 3,
      },
      {
        betterID: "5",
        bet: "OVER",
        poolID: 1,
        amount: 1,
      },
      {
        betterID: "6",
        bet: "UNDER",
        poolID: 1,
        amount: 2,
      },
      {
        betterID: "1",
        bet: "OVER",
        poolID: 2,
        amount: 10,
      },
      {
        betterID: "2",
        bet: "UNDER",
        poolID: 2,
        amount: 5,
      },
      {
        betterID: "3",
        bet: "OVER",
        poolID: 2,
        amount: 7,
      },
      {
        betterID: "4",
        bet: "UNDER",
        poolID: 2,
        amount: 3,
      },
      {
        betterID: "5",
        bet: "OVER",
        poolID: 2,
        amount: 1,
      },
      {
        betterID: "6",
        bet: "UNDER",
        poolID: 2,
        amount: 2,
      },
      {
        betterID: "1",
        bet: "OVER",
        poolID: 3,
        amount: 10,
      },
      {
        betterID: "2",
        bet: "UNDER",
        poolID: 3,
        amount: 5,
      },
      {
        betterID: "3",
        bet: "OVER",
        poolID: 3,
        amount: 7,
      },
      {
        betterID: "4",
        bet: "UNDER",
        poolID: 3,
        amount: 3,
      },
      {
        betterID: "5",
        bet: "OVER",
        poolID: 3,
        amount: 1,
      },
      {
        betterID: "6",
        bet: "UNDER",
        poolID: 3,
        amount: 2,
      },
      {
        betterID: "1",
        bet: "OVER",
        poolID: 4,
        amount: 10,
      },
      {
        betterID: "2",
        bet: "UNDER",
        poolID: 4,
        amount: 5,
      },
      {
        betterID: "3",
        bet: "OVER",
        poolID: 4,
        amount: 7,
      },
      {
        betterID: "4",
        bet: "UNDER",
        poolID: 4,
        amount: 3,
      },
      {
        betterID: "5",
        bet: "OVER",
        poolID: 4,
        amount: 1,
      },
      {
        betterID: "6",
        bet: "UNDER",
        poolID: 4,
        amount: 2,
      },
    ],
  });
  console.log("bets created: ", bets);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
