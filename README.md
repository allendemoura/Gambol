# Prediction Market Simulator API

## Project Description

The Prediction Market Simulator API is the backend of a the [Predictor](https://github.com/allendemoura/predictor-react) web application that simulates prediction market betting without real money. It provides a RESTful interface for managing prediction markets, placing bets, and retrieving market outcomes. This API is designed to be a fun and educational tool for exploring prediction markets without any financial risk, and more importantly, an aggregator of data that can be analyzed by the administrator for insights into public opinion. If users lose all of their credits or "gems" they will recieve a small sum at an interval determined by the administrator in the 'charity' scheduled function.

## Technologies Used

- Node.js
- Express
- Prisma
- node-schedule

## Getting Started

To get started with the Prediction Market Simulator API, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/allendemoura/predictor-backend-API.git
   cd predictor-backend-API
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file and add a connection string to a Prisma compatible SQL database. You can use the `.env.example` file as a template.

4. Initialize Prisma:

   ```bash
   npx prisma db push
   ```

5. Run the application:
   ```bash
   npm start
   ```

## API Endpoints

The API offers the following endpoints:

- `GET /users`: Retrieve a list of all users.
- `GET /users/:id`: Retrieve a user by their ID.
- `GET /users/:id/bets`: Retrieve all bets made by a specific user.
- `POST /users`: Add a new user.
- `POST /users/update`: Update user information.
- `POST /users/delete`: Delete a user.
- `GET /pools`: Retrieve a list of all prediction pools.
- `GET /pools/:id`: Retrieve a prediction pool by its ID.
- `GET /pools/:id/bets`: Retrieve all bets made on a specific prediction pool.
- `POST /pools`: Create a new prediction pool.
- `GET /bets`: Retrieve a list of all bets.
- `POST /bets`: Place a new bet.
- `POST /pools/:id/resolve`: Resolve a prediction pool.

## Configuration

You will need to provide a connection string to a Prisma compatible SQL database in a `.env` file as mentioned above. You can also optionally specify a port. You can use the `.env.example` file as a template.

## Usage

Use the API to interact with prediction markets, place bets, and retrieve market outcomes. You can also use the API to retrieve user information and manage users. The API is designed to be used in conjunction with the [Predictor](https://github.com/allendemoura/predictor-react) web application. The API is also designed to be used with a Prisma compatible SQL database. You can use the [Prisma CLI](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-cli) to manage your database.

## Contributing

If you'd like to contribute to the Prediction Market Simulator API, please follow our feel free to submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

## Future Enhancements

I'm planning on porting this to work as a serverless cloud functions app in the hopes that it will run faster on budget hosting services such as Digital Ocean.

## Contact

For questions or support, please contact me@allendemoura.com
