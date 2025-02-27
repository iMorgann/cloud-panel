export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  user_id: string;
  read: boolean;
  data: any;
  created_at: string;
}