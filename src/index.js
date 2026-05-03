require("dotenv").config();
const AppDataSource = require("./config/data-source");
const app = require("./app");

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection established");
    }

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close();
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = { start, app, AppDataSource };
