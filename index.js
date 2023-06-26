const express = require("express");
const app = express();
const PORT = 8080;

// json middleware
app.use(express.json());

// prisma init
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

// test
app.post("/overUnder/:id", (req, res) => {
  const { id } = req.params;
  const { boy, desc, point } = req.body;

  // check req validity
  if (!boy || !desc || !point) {
    res.status(400).send({ message: "shorn data" });
  } else {
    // send response
    res.send({
      text: `Over/Under for ${boy} 
  ${desc}: ${point}`,
    });
  }
});

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

// add point
app.post("/setPoint", (req, res) => {
  async function main(boy, desc, pointVal) {
    // query for boyID
    try {
      const ourBoy = await prisma.boy.findUniqueOrThrow({
        where: {
          name: boy,
        },
        select: {
          id: true,
        },
      });

      // write point
      const point = await prisma.point.create({
        data: {
          boyID: ourBoy.id,
          desc: desc,
          point: pointVal,
        },
      });
      if (point) {
        res.status(200).send({ message: "success", point });
      } else {
        res.status(400).send({ message: "failure" });
      }
      // error handling
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          res.status(400).send({ message: "Boy not found" });
        } else {
          res.status(400).send(JSON.stringify(e));
        }
      }
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
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
      });
  }
});

// add boy
app.post("/addBoy", (req, res) => {
  // db create row
  async function main(name, role) {
    const boy = await prisma.boy.create({
      data: {
        name: name,
        role: role,
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

// make bet
app.post("/makeBet", (req, res) => {
  async function main(pointID, better, bet) {
    try {
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
        },
      });

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
      // error handling
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          res.status(400).send({ message: "Invalid better or point" });
        } else {
          res.status(400).send(JSON.stringify(e));
        }
      }
      throw e;
    }
  }

  // unpack req
  const { pointID, better, bet } = req.body;

  // check req validity
  if (!pointID || !better) {
    res.status(400).send({ message: "request must include: pointID, better name, bet" });
  } else if (typeof bet != "boolean") {
    res.status(400).send({ message: "bet must be a boolean: true = over, false = under" });
  } else {
    // execute
    main(pointID, better, bet)
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

// run app
app.listen(PORT, () => console.log(`hollerinng on http://localhost:${PORT}`));
