#!/bin/bash

# List of your microservices
services=("profile-control-service")

# Common dependencies
common_deps="express mysql2 dotenv cors"
dev_deps="nodemon"

for service in "${services[@]}"; do
  echo "🚀 Initializing $service ..."

  # Go inside the service directory
  cd "$service" || { echo "❌ Directory $service not found!"; exit 1; }

  # Init Node.js project
  npm init -y

  # Install dependencies
  npm install $common_deps
  npm install --save-dev $dev_deps

  # Create folder structure
  mkdir -p src/{routes,controllers,models}

  # Create basic files if not exist
  [[ ! -f src/server.js ]] && cat <<EOF > src/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// TODO: add routes
app.get("/", (req, res) => {
  res.send("Welcome to $service API 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("$service running on port " + PORT));
EOF

  [[ ! -f src/db.js ]] && cat <<EOF > src/db.js
const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;
EOF

  # Add scripts to package.json
  npx json -I -f package.json -e 'this.scripts={"start":"node src/server.js","dev":"nodemon src/server.js"}'

  # Back to root directory
  cd ..

  echo "✅ $service initialized!"
done

echo "🎉 All services initialized successfully!"
