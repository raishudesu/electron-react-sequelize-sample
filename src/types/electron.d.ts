import { IpcRenderer } from "electron";

declare global {
  interface Window {
    ipcRenderer: IpcRenderer & {
      database: {
        createUser: (name: string, email: string) => Promise<number>;
        getUser: (id: number) => Promise<any>;
        getAllUsers: () => Promise<any[]>;
        updateUser: (id: number, name: string, email: string) => Promise<any>;
        deleteUser: (id: number) => Promise<boolean>;
        createPost: (
          title: string,
          content: string | null,
          authorId: number,
          published: boolean
        ) => Promise<any>;
        getPost: (id: number) => Promise<any>;
        getAllPosts: () => Promise<any[]>;
        updatePost: (
          id: number,
          title: string,
          content: string | null,
          published: boolean
        ) => Promise<any>;
        deletePost: (id: number) => Promise<boolean>;
        setSetting: (key: string, value: string) => Promise<void>;
        getSetting: (key: string) => Promise<string | null>;
      };
    };
  }
}

export {};
