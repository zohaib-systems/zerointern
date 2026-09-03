export interface User {
  id: string;
  email: string;
  name: string | null;
  profilePic: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  trackId: string;
  title: string;
  description: string;
  problem: string;
  brief: string;
  resources: Array<{ title: string; url: string; type: string }>;
  concepts: string[];
  projectOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  userId: string;
  projectId: string;
  repoUrl: string;
  liveUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes: string | null;
  submittedAt: string;
  approvedAt: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionWithDetails extends Submission {
  userName: string | null;
  userEmail: string;
  projectTitle: string;
  trackTitle: string;
  trackId: string;
  projectProblem?: string;
  projectBrief?: string;
}

export interface Certificate {
  id: string;
  userId: string;
  trackId: string;
  issuedAt: string;
  cryptoHash: string;
  verificationCode: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export enum SubmissionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
