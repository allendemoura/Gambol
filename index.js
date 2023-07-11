const express = require("express");
const app = express();
const PORT = 8080;

// json middleware
app.use(express.json());

// prisma init
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

// return all boys
app.get("/boys", (req, res) => {
  // db query func
  async function main() {
    const allBoys = await prisma.boy.findMany();
    res.status(200).send(allBoys);
  }

  main()
    // prisma db connection termination
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
});

// return all points on a boy
app.get("/boys/:id/points", (req, res) => {
  // db query func
  async function main(id) {
    // query for boy
    const ourBoy = await prisma.boy.findUniqueOrThrow({
      where: {
        id: id,
      },
    });

    // query for points
    const points = await prisma.point.findMany({
      where: {
        boyID: id,
      },
      select: {
        id: true,
        desc: true,
        point: true,
        result: true,
      },
    });
    res.status(200).send(points);
  }

  // unpack req
  const { id } = req.params;
  main(parseInt(id))
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      await prisma.$disconnect();
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          res.status(404).send({ message: "boy not found" });
        } else {
          res.status(500).send({ error: e });
        }
      } else {
        console.error(e);
        process.exit(1);
      }
    });
});

// return all active points on a boy
// TODO

// return all bets made by a boy
app.get("/boys/:id/bets", (req, res) => {
  // db query func
  async function main(id) {
    // query for boy
    const ourBoy = await prisma.boy.findUniqueOrThrow({
      where: {
        id: id,
      },
    });

    const bets = await prisma.bet.findMany({
      where: {
        betterID: id,
      },
      select: {
        id: true,
        pointID: true,
        bet: true,
      },
    });
    res.status(200).send(bets);
  }

  // unpack req
  const { id } = req.params;
  main(parseInt(id))
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      await prisma.$disconnect();
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          res.status(404).send({ message: "boy not found" });
        } else {
          res.status(500).send({ error: e });
        }
      } else {
        console.error(e);
        process.exit(1);
      }
    });
});

// add boy
app.post("/boys", (req, res) => {
  // db create row
  async function main(name, role) {
    const boy = await prisma.boy.upsert({
      create: {
        name: name,
        role: role,
      },
      update: {
        role: role,
      },
      where: {
        name: name,
      },
    });
    if (boy) {
      res.status(200).send({ message: "success", boy });
    } else {
      res.status(400).send({ message: "failure" });
    }
  }

  // unpack req
  const { name, role } = req.body;

  // check req validity
  if (!name || !role) {
    res.status(400).send({ message: "request must include: name, role" });
  } else if (role != "MAN" && role != "SHIPLET") {
    res.status(400).send({ message: "role must be one of these strings: 'MAN', 'SHIPLET'" });
  } else {
    // send response
    main(name, role)
      // prisma db connection termination
      .then(async () => {
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
      });
  }
});

// return all points
app.get("/points", (req, res) => {
  // db query func
  async function main() {
    const allPoints = await prisma.point.findMany();
    res.status(200).send(allPoints);
  }

  main()
    // prisma db connection termination
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
});

// return all bets on a point
app.get("/points/:id/bets", (req, res) => {
  // db query func
  async function main(id) {
    // query for point
    const thePoint = await prisma.point.findUniqueOrThrow({
      where: {
        id: id,
      },
    });

    const bets = await prisma.bet.findMany({
      where: {
        pointID: id,
      },
      select: {
        id: true,
        betterID: true,
        bet: true,
      },
    });
    res.status(200).send(bets);
  }

  // unpack req
  const { id } = req.params;
  main(parseInt(id))
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      await prisma.$disconnect();
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          res.status(404).send({ message: "point not found" });
        } else {
          res.status(500).send({ error: e });
        }
      } else {
        console.error(e);
        process.exit(1);
      }
    });
});

// add point
app.post("/points", (req, res) => {
  async function main(boy, desc, pointVal) {
    // query for boyID
    const ourBoy = await prisma.boy.findUniqueOrThrow({
      where: {
        name: boy,
      },
      select: {
        id: true,
      },
    });

    // TODO: check if point already exists and reject if resolved already

    // write point
    const point = await prisma.point.upsert({
      create: {
        boyID: ourBoy.id,
        desc: desc,
        point: pointVal,
      },
      update: {
        point: pointVal,
      },
      where: {
        boyID_desc: {
          boyID: ourBoy.id,
          desc: desc,
        },
      },
    });
    if (point) {
      res.status(200).send({ message: "success", point });
    } else {
      res.status(400).send({ message: "failure" });
    }
  }

  // unpack req
  const { boy, desc, point } = req.body;

  // check req validity
  if (!boy || !desc || !point) {
    res.status(400).send({ message: "request must include: boy, desc, point" });
  } else {
    // execute
    main(boy, desc, point)
      // prisma db connection termination
      .then(async () => {
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        await prisma.$disconnect();
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2025") {
            res.status(400).send({ message: "Boy not found" });
          } else {
            res.status(400).send(JSON.stringify(e));
          }
        } else {
          console.error(e);
          throw e;
          process.exit(1);
        }
      });
  }
});

// return all bets
app.get("/bets", (req, res) => {
  // db query func
  async function main() {
    const allBets = await prisma.bet.findMany();
    res.status(200).send(allBets);
  }

  main()
    // prisma db connection termination
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
});

// make bet
app.post("/bets", (req, res) => {
  async function main(pointID, better, bet) {
    // query for betterID
    const ourBoy = await prisma.boy.findUniqueOrThrow({
      where: {
        name: better,
      },
      select: {
        id: true,
      },
    });

    // query for point
    const thePoint = await prisma.point.findUniqueOrThrow({
      where: {
        id: pointID,
      },
      select: {
        id: true,
        result: true,
      },
    });

    // check if the point has been resolved
    if (thePoint.result !== "PENDING") {
      res.status(400).send({ message: "point has been resolved and so betting is closed" });
      return;
    }

    // write bet
    const theBet = await prisma.bet.upsert({
      create: {
        betterID: ourBoy.id,
        bet: bet,
        pointID: thePoint.id,
      },
      update: {
        bet: bet,
      },
      where: {
        betterID_pointID: {
          betterID: ourBoy.id,
          pointID: thePoint.id,
        },
      },
    });

    if (theBet) {
      res.status(200).send({ message: "success", bet: theBet });
    } else {
      res.status(400).send({ message: "failure" });
    }
  }

  // unpack req
  const { pointID, better, bet } = req.body;

  // check req validity
  if (!pointID || !better || !bet) {
    res.status(400).send({ message: "request must include: pointID, better name, bet" });
  } else if (bet !== "OVER" && bet !== "UNDER") {
    res.status(400).send({ message: "bet must be 'OVER' or 'UNDER'" });
  } else {
    // execute
    main(pointID, better, bet)
      // prisma db connection termination
      .then(async () => {
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        await prisma.$disconnect();
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2025") {
            res.status(400).send({ message: "Invalid better or point", error: e });
          } else {
            res.status(400).send({ error: e });
          }
        } else {
          console.error(e);
          throw e;
          process.exit(1);
        }
      });
  }
});

// resolve point
app.post("/points/:id/resolve", (req, res) => {
  async function main(id, result) {
    // query for point
    const thePoint = await prisma.point.findUniqueOrThrow({
      where: {
        id: id,
      },
    });

    if (thePoint.result !== "PENDING") {
      res.status(400).send({ message: "point has already been resolved" });
      return;
    }

    // update point
    const updatedPoint = await prisma.point.update({
      where: {
        id: id,
      },
      data: {
        result: result,
      },
    });

    // // query for winners
    // const winners = await prisma.bet.findMany({
    //   where: {
    //     pointID: id,
    //     bet: result,
    //   },
    //   select: {
    //     betterID: true,
    //   },
    // });

    // // pay out winners with loop
    // winners.forEach(async (winner) => {
    //   await prisma.boy.update({
    //     where: {
    //       id: winner.betterID,
    //     },
    //     data: {
    //       balance: {
    //         increment: 1,
    //       },
    //     },
    //   });
    // });

    // pay out winners
    const winners = await prisma.boy.updateMany({
      where: {
        bets: {
          some: {
            AND: [
              {
                pointID: id,
              },
              {
                bet: result,
              },
            ],
          },
        },
      },
      data: {
        balance: {
          increment: 1,
        },
      },
    });

    res.status(200).send({ message: "success", updatedPoint, winners });
  }

  // unpack req
  const { id, result } = req.body;

  // validate req
  if (!id || result === undefined) {
    res.status(400).send({ message: "request must include: pointID, result" });
  } else if (result !== "OVER" && result !== "UNDER") {
    res.status(400).send({ message: "result must be one of these strings: 'OVER', 'UNDER'" });
  } else {
    // execute
    main(parseInt(id), result)
      // prisma db connection termination
      .then(async () => {
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        await prisma.$disconnect();
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2025") {
            res.status(400).send({ message: "Invalid point", error: e });
          } else {
            res.status(400).send({ error: e });
          }
        } else {
          console.error(e);
          throw e;
          process.exit(1);
        }
      });
  }
});

// run app
app.listen(PORT, () => console.log(`hollerinng on http://localhost:${PORT}`));
