export interface IReviewUser {
  _id: string;
  name: string;
  email: string;
}

export interface IReview {
  _id: string;
  patient: IReviewUser;
  doctor: IReviewUser;
  appointment: any;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// alias عشان الكومبوننتس اللي بتستورد باسم Review تشتغل من غير تعديل
export type Review = IReview;