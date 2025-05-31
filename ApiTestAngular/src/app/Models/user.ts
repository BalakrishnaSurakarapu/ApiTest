export interface TestUser {
  userId?: number;
  firstName: string;
  lastName: string;
  userName: string;
  mobileNo: string;
  emailId: string;
  password: string;
  imageUrl?: string; // base64 or URL
}