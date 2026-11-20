export interface Channel {
  id: string;
  name: string;
  nameLower: string;
  description: string;
  createdBy: string;
  memberIds: string[];
  createdAt: number;
}
