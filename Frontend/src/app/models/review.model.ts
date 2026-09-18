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
