const pkg = require("@clerk/clerk-sdk-node");
const clerk = pkg.default;
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8080;
const schedule = require("node-schedule");

// json middleware
app.use(express.json());
app.use(cors());

// prisma init
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

// each hour anyone who has a balance of 0 will be brought up to 5
const charity = schedule.scheduleJob("0 * * * *", async () => {
  await prisma.user.updateMany({
    where: {
      balance: 0,
    },
    data: {
      balance: 5,
    },
  });
});

// return all users
app.get("/users", (req, res) => {
  // db query func
  async function main() {
    const allUsers = await prisma.user.findMany();
    res.status(200).send(allUsers);
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

// return a user by id
app.get("/users/:id", (req, res) => {
  // db query func
  async function main(hash) {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        hash: hash,
      },
    });
    res.status(200).send(user);
  }

  // unpack req
  const { id } = req.params;

  // validate req
  main(parseInt(id))
    // prisma db connection termination
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      await prisma.$disconnect();
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          res.status(404).send({ message: "user not found" });
        } else {
          res.status(400).send({ error: e });
        }
      } else {
        console.error(e);
        process.exit(1);
      }
    });
});

// return all bets made by a user
app.get("/users/:id/bets", (req, res) => {
  // db query func
  async function main(id) {
    // query for user
    const user = await prisma.user.findUniqueOrThrow({
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
        poolID: true,
        bet: true,
        amount: true,
      },
    });
    res.status(200).send(bets);
  }

  // unpack req
  const { id } = req.params;
  if (isNaN(id)) {
    res.status(400).send({ message: "id must be a number" });
  } else {
    main(parseInt(id))
      .then(async () => {
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        await prisma.$disconnect();
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2025") {
            res.status(404).send({ message: "user not found" });
          } else {
            res.status(500).send({ error: e });
          }
        } else {
          console.error(e);
          process.exit(1);
        }
      });
  }
});

// add user
app.post("/users", (req, res) => {
  // db create row
  async function main(hash, firstName, lastName) {
    // create user
    const user = await prisma.user.upsert({
      create: {
        hash: hash,
        firstName: firstName,
        lastName: lastName,
      },
      update: {
        firstName: firstName,
        lastName: lastName,
      },
      where: {
        hash: hash,
      },
    });

    if (user) {
      res.status(200).send({ message: "success", user });
    } else {
      res.status(400).send({ message: "failure" });
    }
  }

  const clerkExample = {
    data: {
      birthday: "",
      created_at: 1654012591514,
      email_addresses: [
        {
          email_address: "example@example.org",
          id: "idn_29w83yL7CwVlJXylYLxcslromF1",
          linked_to: [],
          object: "email_address",
          verification: {
            status: "verified",
            strategy: "ticket",
          },
        },
      ],
      external_accounts: [],
      external_id: "567772",
      first_name: "Example",
      gender: "",
      id: "user_29w83sxmDNGwOuEthce5gg56FcC",
      image_url: "https://img.clerk.com/xxxxxx",
      last_name: "Example",
      last_sign_in_at: 1654012591514,
      object: "user",
      password_enabled: true,
      phone_numbers: [],
      primary_email_address_id: "idn_29w83yL7CwVlJXylYLxcslromF1",
      primary_phone_number_id: null,
      primary_web3_wallet_id: null,
      private_metadata: {},
      profile_image_url: "https://www.gravatar.com/avatar?d=mp",
      public_metadata: {},
      two_factor_enabled: false,
      unsafe_metadata: {},
      updated_at: 1654012591835,
      username: null,
      web3_wallets: [],
    },
    object: "event",
    type: "user.created",
  };

  // unpack req
  const { first_name, last_name, id } = req.body.data;

  // check req validity
  if (!first_name || !last_name || !id) {
    res.status(400).send({ message: "request must include: first_name, last_name, and id" });
  } else {
    // send response
    main(id, first_name, last_name)
      // prisma db connection termination
      .then(async () => {
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        await prisma.$disconnect();
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            res.status(409).send({ message: "user already exists" });
          } else {
            res.status(500).send({ error: e });
          }
        } else {
          console.error(e);
          process.exit(1);
        }
      });
  }
});

// delete user
app.post("/users/delete", (req, res) => {
  // db create row
  async function main(hash) {
    // create user
    const user = await prisma.user.delete({
      where: {
        hash: hash,
      },
    });

    if (user) {
      res.status(200).send({ message: "success", user });
    } else {
      res.status(400).send({ message: "failure" });
    }
  }

  const clerkExample = {
    data: {
      deleted: true,
      id: "user_29wBMCtzATuFJut8jO2VNTVekS4",
      object: "user",
    },
    object: "event",
    type: "user.deleted",
  };
  // unpack req
  const { deleted, id } = req.body.data;

  // check req validity
  if (!deleted) {
    res.status(500).send({ message: "ERROR! USER NOT DELETED" });
  } else if (!id) {
    res.status(400).send({ message: "request must include: id" });
  } else {
    // send response
    main(id)
      // prisma db connection termination
      .then(async () => {
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        await prisma.$disconnect();
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            res.status(409).send({ message: "user already exists" });
          } else {
            res.status(500).send({ error: e });
          }
        } else {
          console.error(e);
          process.exit(1);
        }
      });
  }
});

// return all pools
app.get("/pools", (req, res) => {
  // db query func
  async function main() {
    const allPools = await prisma.pool.findMany();
    res.status(200).send(allPools);
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

// return a pool by id
app.get("/pools/:id", (req, res) => {
  // active pools query
  async function active() {
    const activePools = await prisma.pool.findMany({
      where: {
        result: "PENDING",
      },
    });
    res.status(200).send(activePools);
  }
  // db query func
  async function main(id) {
    const pool = await prisma.pool.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
    res.status(200).send(pool);
  }

  // unpack req
  const { id } = req.params;

  // validate req
  if (id === "active" || id === "open" || id === "pending") {
    // return all active pools
    active(parseInt(id))
      .then(async () => {
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
      });
  } else if (isNaN(id)) {
    res.status(400).send({ message: "id must be a number" });
  } else {
    main(parseInt(id))
      .then(async () => {
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        await prisma.$disconnect();
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2025") {
            res.status(404).send({ message: "pool not found" });
          } else {
            res.status(500).send({ error: e });
          }
        } else {
          console.error(e);
          process.exit(1);
        }
      });
  }
});

// return all bets on a pool
app.get("/pools/:id/bets", (req, res) => {
  // db query func
  async function main(id) {
    // check that pool exists
    const thePool = await prisma.pool.findUniqueOrThrow({
      where: {
        id: id,
      },
    });

    const bets = await prisma.bet.findMany({
      where: {
        poolID: id,
      },
      select: {
        id: true,
        betterID: true,
        bet: true,
        amount: true,
      },
    });
    res.status(200).send(bets);
  }

  // unpack req
  const { id } = req.params;
  if (isNaN(id)) {
    res.status(400).send({ message: "id must be a number" });
  } else {
    main(parseInt(id))
      .then(async () => {
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        await prisma.$disconnect();
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2025") {
            res.status(404).send({ message: "pool not found" });
          } else {
            res.status(500).send({ error: e });
          }
        } else {
          console.error(e);
          process.exit(1);
        }
      });
  }
});

// add pool
app.post("/pools", (req, res) => {
  async function main(desc, point) {
    // check if pool already exists
    const oldPool = await prisma.pool.findUnique({
      where: {
        desc: desc,
      },
    });

    // reject point change if pool has been resolved
    if (oldPool && oldPool.result !== "PENDING") {
      res.status(409).send({ message: "pool exists and has already been resolved" });
      return;
    }

    // reject point change if pool has bets on it
    if (oldPool && oldPool.overPool + oldPool.underPool > 0) {
      res.status(409).send({
        message: "cannot change the point on a pool that has already been bet on",
      });
      return;
    }

    // write pool
    const pool = await prisma.pool.upsert({
      create: {
        desc: desc,
        point: point,
      },
      update: {
        point: point,
      },
      where: {
        desc: desc,
      },
    });
    if (pool) {
      res.status(200).send({ message: "success", pool });
    } else {
      res.status(400).send({ message: "failure" });
    }
  }

  // unpack req
  const { desc, point } = req.body;

  // check req validity
  if (!desc || !point) {
    res.status(400).send({ message: "request must include: desc, point" });
  } else {
    // execute
    main(desc, point)
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
  async function main(poolID, better, bet, amount) {
    // query for better's info
    const theUser = await prisma.user.findUniqueOrThrow({
      where: {
        name: better,
      },
      select: {
        id: true,
        balance: true,
      },
    });

    // check if better has enough in balance to make the bet
    if (theUser.balance < amount) {
      res.status(400).send({
        message: "better does not have enough in their balance to make this bet",
        currentBalance: theUser.balance,
      });
      return;
    }

    // query for pool
    const thePool = await prisma.pool.findUniqueOrThrow({
      where: {
        id: poolID,
      },
      select: {
        id: true,
        result: true,
      },
    });

    // check if the pool has been resolved
    if (thePool.result !== "PENDING") {
      res.status(400).send({ message: "pool has been resolved and so betting is closed" });
      return;
    }

    // check if bet exists
    const theBet = await prisma.bet.findUnique({
      where: {
        betterID_poolID: {
          betterID: theUser.id,
          poolID: thePool.id,
        },
      },
    });

    // if bet conflicts, reject
    if (theBet && theBet.bet && theBet.bet !== bet) {
      res.status(400).send({
        message: "better already has a bet on the other side of this pool",
        theBet,
      });
      return;
    }

    // write bet
    const newBet = await prisma.bet.upsert({
      create: {
        betterID: theUser.id,
        bet: bet,
        poolID: thePool.id,
        amount: amount,
      },
      update: {
        amount: {
          increment: amount,
        },
      },
      where: {
        betterID_poolID: {
          betterID: theUser.id,
          poolID: thePool.id,
        },
      },
    });

    // subtract from user balance
    const updatedUser = await prisma.user.update({
      where: {
        id: theUser.id,
      },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    // add amount to pool

    // check if over or under
    if (bet === "OVER") {
      const updatedPool = await prisma.pool.update({
        where: {
          id: thePool.id,
        },
        data: {
          overPool: {
            increment: amount,
          },
        },
      });
    } else if (bet === "UNDER") {
      const updatedPool = await prisma.pool.update({
        where: {
          id: thePool.id,
        },
        data: {
          underPool: {
            increment: amount,
          },
        },
      });
    }

    if (newBet) {
      res.status(200).send({
        message: "success. note that if this bet already existed, the new bet amount will be added to it.",
        oldBet: theBet,
        currentBet: newBet,
      });
    } else {
      res.status(400).send({ message: "failure" });
    }
  }

  // unpack req
  const { poolID, better, bet, amount } = req.body;

  // check req validity
  if (!poolID || !better || !bet || !amount) {
    res.status(400).send({
      message: "request must include: poolID, better name, bet, amount",
    });
  } else if (bet !== "OVER" && bet !== "UNDER") {
    res.status(400).send({ message: "bet must be 'OVER' or 'UNDER'" });
  } else if (amount <= 0) {
    res.status(400).send({ message: "amount must be positive int" });
  } else {
    // execute
    main(poolID, better, bet, amount)
      // prisma db connection termination
      .then(async () => {
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        await prisma.$disconnect();
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2025") {
            res.status(400).send({ message: "Invalid better or pool", error: e });
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

// resolve pool
app.post("/pools/:id/resolve", (req, res) => {
  async function main(id, result) {
    // query for pool
    const thePool = await prisma.pool.findUniqueOrThrow({
      where: {
        id: id,
      },
    });

    // check if the pool has been resolved already
    if (thePool.result !== "PENDING") {
      res.status(400).send({ message: "pool has already been resolved" });
      return;
    }

    // update pool
    const updatedPool = await prisma.pool.update({
      where: {
        id: id,
      },
      data: {
        result: result,
      },
    });

    // determine losing result and payout amount
    let payout;
    let winnerPool;
    if (updatedPool.result === "OVER") {
      losingResult = "UNDER";
      payout = updatedPool.underPool;
      winnerPool = updatedPool.overPool;
    } else if (updatedPool.result === "UNDER") {
      losingResult = "OVER";
      payout = updatedPool.overPool;
      winnerPool = updatedPool.underPool;
    }

    // pay out winners

    // query for winners and select their winning bets
    const winners = await prisma.user.findMany({
      where: {
        bets: {
          some: {
            AND: [
              {
                poolID: id,
              },
              {
                bet: result,
              },
            ],
          },
        },
      },
      select: {
        id: true,
        bets: {
          where: {
            AND: [
              {
                poolID: id,
              },
              {
                bet: result,
              },
            ],
          },
        },
      },
    });

    for (const winner of winners) {
      // calculate winnings proportionate to bet
      const winnings = Math.floor((winner.bets[0].amount / winnerPool) * payout);

      await prisma.user.update({
        where: {
          id: winner.id,
        },
        data: {
          balance: {
            increment: winnings + winner.bets[0].amount,
          },
        },
      });
    }

    res.status(200).send({ message: "success", updatedPool, winners });
  }

  // unpack req
  const { result } = req.body;
  const { id } = req.params;

  // validate req
  if (!id || result === undefined) {
    res.status(400).send({ message: "request must include: result" });
  } else if (result !== "OVER" && result !== "UNDER") {
    res.status(400).send({
      message: "result must be one of these strings: 'OVER', 'UNDER'",
    });
  } else if (isNaN(id)) {
    res.status(400).send({ message: "id must be a number" });
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
            res.status(400).send({ message: "Invalid pool", error: e });
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
