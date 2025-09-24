// Import sequelize instance
export { sequelize } from "./sequelize.js";

// Import and initialize models
import { User } from "./User";
import { Post } from "./Post";
import { Setting } from "./Setting";

// Define associations after models are imported
User.hasMany(Post, { foreignKey: "authorId", as: "posts" });
Post.belongsTo(User, { foreignKey: "authorId", as: "author" });

export { User, Post, Setting };
