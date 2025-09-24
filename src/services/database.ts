import { sequelize, User, Post, Setting } from "../models";

class DatabaseService {
  private initialized = false;

  /**
   * Initialize the database connection and sync models
   */
  public async initialize(): Promise<void> {
    try {
      console.log("Initializing Sequelize database...");

      // Test the connection
      await sequelize.authenticate();
      console.log("Database connection established successfully");

      // Sync all models with the database
      await sequelize.sync({ force: false });
      console.log("Database models synchronized successfully");

      this.initialized = true;
      console.log("Database service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }

  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    if (this.initialized) {
      await sequelize.close();
      this.initialized = false;
      console.log("Database connection closed");
    }
  }

  // User operations
  public async createUser(name: string, email: string) {
    if (!this.initialized) throw new Error("Database not initialized");

    return await User.create({ name, email });
  }

  public async getUser(id: number) {
    if (!this.initialized) throw new Error("Database not initialized");

    const user = await User.findByPk(id, {
      include: [{ association: "posts" }],
    });
    return user?.toJSON();
  }

  public async getAllUsers() {
    if (!this.initialized) throw new Error("Database not initialized");

    const users = await User.findAll({
      include: [{ association: "posts" }],
      order: [["createdAt", "DESC"]],
    });
    return users.map((user) => user.toJSON());
  }

  public async updateUser(id: number, name: string, email: string) {
    if (!this.initialized) throw new Error("Database not initialized");

    const user = await User.findByPk(id);
    if (!user) throw new Error("User not found");

    const updatedUser = await user.update({ name, email });
    return updatedUser.toJSON();
  }

  public async deleteUser(id: number) {
    if (!this.initialized) throw new Error("Database not initialized");

    const user = await User.findByPk(id);
    if (!user) throw new Error("User not found");

    await user.destroy();
    return { success: true };
  }

  // Post operations
  public async createPost(
    title: string,
    content: string | null,
    authorId: number,
    published: boolean = false
  ) {
    if (!this.initialized) throw new Error("Database not initialized");

    const post = await Post.create({ title, content, authorId, published });
    return post.toJSON();
  }

  public async getPost(id: number) {
    if (!this.initialized) throw new Error("Database not initialized");

    const post = await Post.findByPk(id, {
      include: [{ association: "author" }],
    });
    return post?.toJSON();
  }

  public async getAllPosts() {
    if (!this.initialized) throw new Error("Database not initialized");

    const posts = await Post.findAll({
      include: [{ association: "author" }],
      order: [["createdAt", "DESC"]],
    });
    return posts.map((post) => post.toJSON());
  }

  public async updatePost(
    id: number,
    title: string,
    content: string | null,
    published: boolean
  ) {
    if (!this.initialized) throw new Error("Database not initialized");

    const post = await Post.findByPk(id);
    if (!post) throw new Error("Post not found");

    const updatedPost = await post.update({ title, content, published });
    return updatedPost.toJSON();
  }

  public async deletePost(id: number) {
    if (!this.initialized) throw new Error("Database not initialized");

    const post = await Post.findByPk(id);
    if (!post) throw new Error("Post not found");

    await post.destroy();
    return { success: true };
  }

  // Settings operations
  public async setSetting(key: string, value: string) {
    if (!this.initialized) throw new Error("Database not initialized");

    const [setting] = await Setting.findOrCreate({
      where: { key },
      defaults: { key, value },
    });

    if (setting.value !== value) {
      const updatedSetting = await setting.update({ value, key });
      return updatedSetting.toJSON();
    }

    return setting.toJSON();
  }

  public async getSetting(key: string) {
    if (!this.initialized) throw new Error("Database not initialized");

    const setting = await Setting.findByPk(key);
    return setting?.value || null;
  }

  public async getAllSettings() {
    if (!this.initialized) throw new Error("Database not initialized");

    const settings = await Setting.findAll();
    return settings.map((setting) => setting.toJSON());
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
