import createApi from "./api";
import { CommitData } from "../types/diff"; 

// Create a new API instance with the baseURL set to port 8082
const api = createApi("http://localhost:8082");

export const commitService = {
  // Create a new commit
  createCommit: async (commitData: CommitData): Promise<CommitData> => {
    try {
      const response = await api.post("/commits/", commitData);
      return response.data;
    } catch (error) {
      console.error("Failed to create commit:", error);
      throw error;
    }
  },

  // Get all commits
  getCommits: async (): Promise<CommitData[]> => {
    try {
      const response = await api.get("/commits");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch commits:", error);
      throw error;
    }
  },

  // Get a specific commit by ID
  getCommit: async (id: string): Promise<CommitData> => {
    try {
      const response = await api.get(`/commits/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch commit with ID: ${id}`, error);
      throw error;
    }
  },

  // Update an existing commit
  updateCommit: async (id: string, commitData: CommitData): Promise<CommitData> => {
    try {
      const response = await api.put(`/commits/${id}`, commitData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update commit with ID: ${id}`, error);
      throw error;
    }
  },

  // Delete a commit by ID
  deleteCommit: async (id: string): Promise<void> => {
    try {
      const response = await api.delete(`/commits/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete commit with ID: ${id}`, error);
      throw error;
    }
  },

  // Get commit count by locationID and date
  getCommitCountByLocationAndDate: async (locationID: string, date: string): Promise<{ locationID: string, date: string, commit_count: number }> => {
    try {
      const response = await api.get("/commits/countByLocationAndDate", {
        params: {
          locationID,
          date,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch commit count:", error);
      throw error;
    }
  },
};
