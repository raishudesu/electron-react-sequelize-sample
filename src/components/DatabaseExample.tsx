import React, { useState, useEffect } from "react";

// Type assertion for the custom database API
const ipcRenderer = window.ipcRenderer as any;

// Define types for our data
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  posts?: Post[];
}

interface Post {
  id: number;
  title: string;
  content: string | null;
  published: boolean;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

const DatabaseExample: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [userForm, setUserForm] = useState({ name: "", email: "" });
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    authorId: 0,
    published: false,
  });

  // Load users and posts on component mount
  useEffect(() => {
    loadUsers();
    loadPosts();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await ipcRenderer.database.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      setError("Failed to load users");
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsData = await ipcRenderer.database.getAllPosts();
      setPosts(postsData);
    } catch (err) {
      setError("Failed to load posts");
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setError(null);
    setRefreshing(true);
    try {
      await Promise.all([loadUsers(), loadPosts()]);
    } finally {
      setRefreshing(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;

    try {
      setLoading(true);
      await ipcRenderer.database.createUser(userForm.name, userForm.email);
      setUserForm({ name: "", email: "" });
      await refreshData();
    } catch (err) {
      setError("Failed to create user");
      console.error("Error creating user:", err);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title || !postForm.authorId) return;

    try {
      setLoading(true);
      await ipcRenderer.database.createPost(
        postForm.title,
        postForm.content || null,
        postForm.authorId,
        postForm.published
      );
      setPostForm({ title: "", content: "", authorId: 0, published: false });
      await refreshData();
    } catch (err) {
      setError("Failed to create post");
      console.error("Error creating post:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      setLoading(true);
      await ipcRenderer.database.deleteUser(id);
      await refreshData();
    } catch (err) {
      setError("Failed to delete user");
      console.error("Error deleting user:", err);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      setLoading(true);
      await ipcRenderer.database.deletePost(id);
      await refreshData();
    } catch (err) {
      setError("Failed to delete post");
      console.error("Error deleting post:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Database Example with Prisma</h1>
        <button
          onClick={refreshData}
          disabled={loading || refreshing}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Users</h2>

          {/* Create User Form */}
          <form onSubmit={createUser} className="mb-6">
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm({ ...userForm, name: e.target.value })
                }
                className="border border-gray-300 rounded px-3 py-2"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm({ ...userForm, email: e.target.value })
                }
                className="border border-gray-300 rounded px-3 py-2"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Create User
              </button>
            </div>
          </form>

          {/* Users List */}
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="border border-gray-200 rounded p-3 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="text-xs text-gray-500">
                    {user.posts?.length || 0} posts
                  </div>
                </div>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Posts</h2>

          {/* Create Post Form */}
          <form onSubmit={createPost} className="mb-6">
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={postForm.title}
                onChange={(e) =>
                  setPostForm({ ...postForm, title: e.target.value })
                }
                className="border border-gray-300 rounded px-3 py-2"
                required
              />
              <textarea
                placeholder="Content"
                value={postForm.content}
                onChange={(e) =>
                  setPostForm({ ...postForm, content: e.target.value })
                }
                className="border border-gray-300 rounded px-3 py-2"
                rows={3}
              />
              <select
                value={postForm.authorId}
                onChange={(e) =>
                  setPostForm({
                    ...postForm,
                    authorId: parseInt(e.target.value),
                  })
                }
                className="border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value={0}>Select Author</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={postForm.published}
                  onChange={(e) =>
                    setPostForm({ ...postForm, published: e.target.checked })
                  }
                  className="mr-2"
                />
                Published
              </label>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Create Post
              </button>
            </div>
          </form>

          {/* Posts List */}
          <div className="space-y-2">
            {posts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{post.title}</div>
                    {post.content && (
                      <div className="text-sm text-gray-600 mt-1">
                        {post.content}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      By: {post.author?.name || "Unknown"} •
                      {post.published ? " Published" : " Draft"} •
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 ml-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseExample;
