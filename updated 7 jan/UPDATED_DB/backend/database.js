const { Sequelize, DataTypes } = require("sequelize");

const db = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false
});

// ---------- USER ----------
const User = db.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: "users",
  timestamps: true
});

// ---------- RATING ----------
const Rating = db.define("Rating", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  movie_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: "ratings",
  timestamps: true
});

// ---------- WATCHLIST ----------
const Watchlist = db.define("Watchlist", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  movie_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  movie_name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: "watchlist",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["user_id", "movie_id"]
    }
  ]
});

// ---------- SYNC ----------
(async () => {
  try {
    await db.authenticate();
    await db.sync({ force: true }); // ⚠️ FOR DEMO: fresh DB
    console.log("✅ Database synced");
  } catch (err) {
    console.error(err);
  }
})();

module.exports = { db, User, Rating, Watchlist };
