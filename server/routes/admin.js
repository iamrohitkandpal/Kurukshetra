const express = require("express");
const router = express.Router();
const { getDb, getMongoDb } = require("../config/dbManager");
const { auth } = require("../middleware/auth");
const { exec } = require("child_process");
const logger = require("../utils/logger");
const User = require("../models/mongo/User");
const fs = require("fs");
const path = require("path");

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get("/users", auth, async (req, res) => {
  try {
    // A01: Broken Access Control - Not properly checking admin role
    // Should check if req.user.role === 'admin'

    const { dbType } = req;

    if (dbType === "mongodb") {
      const users = await User.find().select("-password -mfaSecret");
      return res.json(users);
    } else {
      const db = getDb();
      const users = await db.all(`
        SELECT id, username, email, role, created_at
        FROM users
      `);

      return res.json(users);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete("/users/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { dbType } = req;

    // A01: Broken Access Control - Missing admin role check

    if (dbType === "mongodb") {
      await User.findByIdAndDelete(id);
      return res.json({ success: true });
    } else {
      const db = getDb();

      // A03: SQL Injection vulnerability
      await db.run(`DELETE FROM users WHERE id = ${id}`);

      return res.json({ success: true });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route   GET /api/admin/system-info
 * @desc    Get system information
 * @access  Private/Admin
 */
router.get("/system-info", auth, (req, res) => {
  try {
    // A01: Missing admin role check

    // A03: Command Injection vulnerability - direct passing of user input to exec
    const command = req.query.command || "uname -a";

    exec(command, (error, stdout, stderr) => {
      if (error) {
        logger.error(`exec error: ${error}`);
        return res.status(500).json({ error: "Command execution failed" });
      }

      return res.json({
        output: stdout,
        error: stderr,
      });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route   GET /api/admin/system/stats
 * @desc    Get system stats
 * @access  Private/Admin
 */
router.get("/system/stats", auth, async (req, res) => {
  try {
    // A01: Missing admin role check

    // A05: Information exposure
    const systemStats = {
      cpuUsage: Math.floor(Math.random() * 100),
      memoryUsage: Math.floor(Math.random() * 100),
      diskSpace: Math.floor(Math.random() * 100),
      activeUsers: Math.floor(Math.random() * 50),
      failedLogins: Math.floor(Math.random() * 20),
    };

    return res.json(systemStats);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route   GET /api/admin/logs
 * @desc    Get system logs
 * @access  Private/Admin
 */
router.get("/logs", auth, (req, res) => {
  try {
    // A01: Missing admin role check

    // A05: Information Disclosure - System logs may contain sensitive data
    const logPath = path.join(__dirname, "..", "logs", "app.log");

    if (!fs.existsSync(logPath)) {
      // Generate mock logs if file doesn't exist
      const mockLogs = [];
      for (let i = 0; i < 20; i++) {
        mockLogs.push({
          timestamp: new Date(Date.now() - i * 3600000),
          level: i % 5 === 0 ? "error" : "info",
          message: `Log message ${i}`,
          user: i % 2 === 0 ? "admin" : "user123",
          ip: "192.168.1." + Math.floor(Math.random() * 255),
        });
      }
      return res.json(mockLogs);
    }

    fs.readFile(logPath, "utf8", (err, data) => {
      if (err) {
        logger.error(`Error reading logs: ${err}`);
        return res.status(500).json({ error: "Failed to read logs" });
      }

      try {
        const logs = data
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => {
            try {
              return JSON.parse(line);
            } catch (e) {
              return { raw: line };
            }
          });

        return res.json(logs);
      } catch (parseError) {
        logger.error(`Error parsing logs: ${parseError}`);
        return res.status(500).json({ error: "Failed to parse logs" });
      }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route   DELETE /api/admin/logs
 * @desc    Clear system logs
 * @access  Private/Admin
 */
router.delete("/logs", auth, (req, res) => {
  try {
    // A01: Missing admin role check

    const logPath = path.join(__dirname, "..", "logs", "app.log");

    if (fs.existsSync(logPath)) {
      fs.writeFile(logPath, "", (err) => {
        if (err) {
          logger.error(`Error clearing logs: ${err}`);
          return res.status(500).json({ error: "Failed to clear logs" });
        }

        return res.json({ success: true });
      });
    } else {
      return res.json({ success: true });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
