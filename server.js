const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require('bcryptjs');

app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "assignmentdb"
});

// Login route
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching user from database' });
        }

        if (data.length === 0) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        const user = data[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        // No JWT issued here
        return res.json({ message: 'Login successful', user: { id: user.id, username: user.username } });
    });
});

// Fetch all users
app.get("/users", (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: "Error fetching users" });
        return res.json(data);
    });
});

// Fetch all technicians
app.get("/technicians", (req, res) => {
    const sql = "SELECT * FROM technicians";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: "Error fetching technicians" });
        return res.json(data);
    });
});

// Fetch all appliance types
app.get("/appliance_types", (req, res) => {
    const sql = "SELECT * FROM appliance_types";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: "Error fetching appliance_types" });
        return res.json(data);
    });
});

// Fetch locations
app.get("/locations", (req, res) => {
    const locations = [
        "Pune",
        "Banglore",
        "Mumbai",
        "Hyderabad",
        "Delhi",
    ];
    res.json(locations);
});

// Search appliances by type name
app.get("/search-appliances", (req, res) => {
    const query = req.query.q || ""; // User input
    const sql = "SELECT type_name FROM appliance_types WHERE type_name LIKE ?";
    
    db.query(sql, [`%${query}%`], (err, results) => {
        if (err) {
            console.error("Error fetching appliance types:", err.message);
            res.status(500).send("Error retrieving appliance types.");
        } else {
            // Extract only the type_name field from the results
            const suggestions = results.map((row) => row.type_name);
            res.json(suggestions);
        }
    });
});

// Start the server
app.listen(8081, () => {
    console.log("Server is listening on port 8081");
});
