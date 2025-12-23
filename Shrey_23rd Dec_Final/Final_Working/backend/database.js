const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require("uuid");

const db = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

const User = db.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },

    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    refreshToken: {
        type: DataTypes.STRING,
        allowNull: true
    },

}, {
    tableName: "users",
    timestamps: true,
    freezeTableName: true,
    createdAt: true,
    updatedAt: true
});

/* ===================== ADDED WATCHLIST ===================== */

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

  movie_title: {
    type: DataTypes.STRING,
    allowNull: false
  }

}, {
  tableName: "watchlist",
  timestamps: true
});

/* ===================== ADDED RATING ===================== */

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
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  }

}, {
  tableName: "ratings",
  timestamps: true
});



/* ===================== ADDED  ===================== */

const MovieActivity = db.define("MovieActivity", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    movieId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    activityType: {
        type: DataTypes.STRING, // "view" | "rating"
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: "movie_activity",
    timestamps: true
});

/* ================================================================================ */

(async () => {
    try {
        await db.authenticate();
        await db.sync({ alter: true });
        console.log('✅ Database connected and synced');
    } catch (err) {
        console.error('DB connection failed:', err);
    }
})();

module.exports = { User, MovieActivity, Watchlist, Rating, db };
