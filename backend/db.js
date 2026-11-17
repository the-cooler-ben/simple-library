import { Sequelize, DataTypes } from "sequelize";

export const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "library.db",
    logging: false,
});

export const Book = sequelize.define("Book", {
    title: { type: DataTypes.STRING, allowNull: false },
    authors: { type: DataTypes.JSON, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: true },
    checked_out: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    userId: { type: DataTypes.INTEGER, allowNull: true },
}, {
    tableName: "books",
    timestamps: false,
});

export const User = sequelize.define("User", {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: "users",
    timestamps: false,
});

Book.belongsTo(User, { foreignKey: "userId", as: "owner" });
User.hasMany(Book, { foreignKey: "userId" });