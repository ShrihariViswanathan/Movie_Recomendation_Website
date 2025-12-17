const {Sequelize, DataTypes} = require('sequelize');
const {v4: uuidv4} = require("uuid");

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

    username : {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    password : {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },

    refreshToken : {
        type: DataTypes.STRING,
        allowNull: true
    },

}, {
    tableName: "users",
    timestamps: true,
    freezeTableName: true,
    createdAt: true,
    updatedAt: true
}

);

(async () => {
  try {
    await db.authenticate();        // check connection
    await db.sync({ alter: true }); // sync models
    console.log('✅ Database connected and synced');
  } catch (err) {
    console.error('DB connection failed:', err);
  }
})();



module.exports = {User, db};


