const request = require("supertest");
const AppDataSource = require("../src/config/data-source");
const app = require("../src/app");

describe("POST /users - User Registration Integration Tests", () => {
  let userRepository;

  // Setup: Initialize database before all tests
  beforeAll(async () => {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      userRepository = AppDataSource.getRepository("User");
    } catch (error) {
      console.error("Database setup failed:", error);
      throw error;
    }
  });

  // Cleanup: Delete all test users before each test
  beforeEach(async () => {
    try {
      // Clear all users from the database
      await userRepository.clear();
    } catch (error) {
      console.error("Error clearing test data:", error);
      throw error;
    }
  });

  // Cleanup: Close database connection after all tests
  afterAll(async () => {
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
    } catch (error) {
      console.error("Error closing database:", error);
    }
  });

  test("Should successfully register a new user", async () => {
    const userData = {
      email: "john@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    };

    const response = await request(app)
      .post("/users")
      .send(userData)
      .expect(201);

    // Verify response structure
    expect(response.body).toHaveProperty("id");
    expect(response.body.email).toBe(userData.email);
    expect(response.body.firstName).toBe(userData.firstName);
    expect(response.body.lastName).toBe(userData.lastName);
    expect(response.body).toHaveProperty("createdAt");

    // Verify user is actually stored in the database
    const savedUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    expect(savedUser).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.password).toBe(userData.password);
    expect(savedUser.firstName).toBe(userData.firstName);
    expect(savedUser.lastName).toBe(userData.lastName);
  });

  test("Should successfully register a user with minimal data (email and password only)", async () => {
    const userData = {
      email: "minimal@example.com",
      password: "securepass456",
    };

    const response = await request(app)
      .post("/users")
      .send(userData)
      .expect(201);

    expect(response.body.email).toBe(userData.email);
    expect(response.body.firstName).toBeNull();
    expect(response.body.lastName).toBeNull();

    // Verify in database
    const savedUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    expect(savedUser).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
  });

  test("Should reject registration with missing email", async () => {
    const userData = {
      password: "password123",
      firstName: "John",
    };

    const response = await request(app)
      .post("/users")
      .send(userData)
      .expect(400);

    expect(response.body.error).toContain("Email and password are required");
  });

  test("Should reject registration with missing password", async () => {
    const userData = {
      email: "nopass@example.com",
      firstName: "Jane",
    };

    const response = await request(app)
      .post("/users")
      .send(userData)
      .expect(400);

    expect(response.body.error).toContain("Email and password are required");
  });

  test("Should reject registration with invalid email format", async () => {
    const userData = {
      email: "invalidemail",
      password: "password123",
    };

    const response = await request(app)
      .post("/users")
      .send(userData)
      .expect(400);

    expect(response.body.error).toContain("Invalid email format");

    // Verify user was not created
    const userCount = await userRepository.count();
    expect(userCount).toBe(0);
  });

  test("Should reject registration with duplicate email", async () => {
    const userData = {
      email: "duplicate@example.com",
      password: "password123",
    };

    // Register first user
    await request(app)
      .post("/users")
      .send(userData)
      .expect(201);

    // Try to register with same email
    const response = await request(app)
      .post("/users")
      .send(userData)
      .expect(409);

    expect(response.body.error).toContain("User with this email already exists");

    // Verify only one user exists in database
    const userCount = await userRepository.count();
    expect(userCount).toBe(1);
  });

  test("Should verify user is persisted in PostgreSQL database", async () => {
    const userData = {
      email: "persist@example.com",
      password: "testpass789",
      firstName: "Persist",
      lastName: "User",
    };

    // Register user
    const response = await request(app)
      .post("/users")
      .send(userData)
      .expect(201);

    const userId = response.body.id;

    // Directly query database to verify persistence
    const userFromDb = await userRepository.findOne({
      where: { id: userId },
    });

    expect(userFromDb).toBeDefined();
    expect(userFromDb.id).toBe(userId);
    expect(userFromDb.email).toBe(userData.email);
    expect(userFromDb.password).toBe(userData.password);
    expect(userFromDb.firstName).toBe(userData.firstName);
    expect(userFromDb.lastName).toBe(userData.lastName);
    expect(userFromDb.createdAt).toBeInstanceOf(Date);
    expect(userFromDb.updatedAt).toBeInstanceOf(Date);
  });

  test("Should handle concurrent registrations correctly", async () => {
    const users = [
      { email: "user1@example.com", password: "pass1" },
      { email: "user2@example.com", password: "pass2" },
      { email: "user3@example.com", password: "pass3" },
    ];

    // Register all users concurrently
    const responses = await Promise.all(
      users.map((userData) => request(app).post("/users").send(userData))
    );

    // Verify all registrations were successful
    responses.forEach((response) => {
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
    });

    // Verify all users are in database
    const userCount = await userRepository.count();
    expect(userCount).toBe(3);

    // Verify each user exists
    for (const userData of users) {
      const user = await userRepository.findOne({
        where: { email: userData.email },
      });
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
    }
  });

  test("Should return unique IDs for each registered user", async () => {
    const user1Data = {
      email: "uniqueid1@example.com",
      password: "pass1",
    };

    const user2Data = {
      email: "uniqueid2@example.com",
      password: "pass2",
    };

    const response1 = await request(app)
      .post("/users")
      .send(user1Data)
      .expect(201);

    const response2 = await request(app)
      .post("/users")
      .send(user2Data)
      .expect(201);

    expect(response1.body.id).not.toBe(response2.body.id);
  });
});
