const { DataSource } = require("typeorm");
const User = require("../models/User");

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "ecommerce",
  entities: [User],
  synchronize: true,
  logging: process.env.NODE_ENV !== "test",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

module.exports = AppDataSource;
