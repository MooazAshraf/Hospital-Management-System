import {
  AfterViewInit,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ImagePathPipe } from '../../../pipes/image-path.pipe';

import { DoctorService } from '../../../services/doctor.service';
import { Doctor } from '../../../models/doctor.model';

import { ReviewsService } from '../../../services/reviews.service';
import { IReview } from '../../../models/review.model';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ImagePathPipe],
  templateUrl: './doctor-profile.component.html',
})
export class DoctorProfileComponent
  implements OnInit, AfterViewInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly doctorService =
    inject(DoctorService);

  private readonly reviewsService =
    inject(ReviewsService);

  private readonly authService =
    inject(AuthService);

  readonly doctor =
    signal<Doctor | null>(null);

  readonly isLoading =
    signal(false);

  readonly errorMessage =
    signal('');

  // REVIEWS
  reviews: IReview[] = [];

  isLoggedIn = false;

  selectedRating = 0;

  reviewComment = '';

  reviewMessage = '';

  reviewError = '';

  isReviewSubmitting = false;

  editingReviewId: string | null = null;

  // DELETE MODAL
  showDeleteModal = false;

  reviewToDelete: IReview | null = null;


  // DEPARTMENT
  get departmentName(): string {
    const dept =
      this.doctor()?.department;

    return dept &&
      typeof dept === 'object'
      ? dept.name
      : 'N/A';
  }


  // INIT
  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage.set(
        'Doctor not found.'
      );
      return;
    }

    this.isLoading.set(true);

    this.doctorService
      .getDoctorById(id)
      .subscribe({

        next: (doctor) => {

          this.doctor.set(doctor);

          this.isLoading.set(false);

          this.checkLogin();

          this.loadReviews();
        },

        error: () => {

          this.errorMessage.set(
            'Could not load this doctor. Please try again.'
          );

          this.isLoading.set(false);
        },

      });
  }


  // AUTO SCROLL
  ngAfterViewInit(): void {

    if (
      this.route.snapshot.fragment ===
      'reviews'
    ) {

      setTimeout(() => {

        document
          .getElementById('reviews')
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

      }, 300);
    }
  }


  // CHECK LOGIN
  checkLogin(): void {

    this.isLoggedIn =
      this.authService.isLoggedIn();
  }


  // LOAD REVIEWS
  loadReviews(): void {

    const doctor =
      this.doctor();

    if (!doctor) {
      return;
    }

    const doctorUserId =
      this.getDoctorUserId(doctor);

    console.log(
      'DOCTOR USER ID:',
      doctorUserId
    );

    this.reviewsService
      .getReviews()
      .subscribe({

        next: (response) => {

          console.log(
            'ALL REVIEWS:',
            response.data
          );

          this.reviews =
            response.data.filter(
              (review) => {

                const reviewDoctorId =
                  typeof review.doctor === 'object'
                    ? review.doctor?._id
                    : review.doctor;

                console.log(
                  'REVIEW DOCTOR ID:',
                  reviewDoctorId
                );

                console.log(
                  'MATCH:',
                  String(reviewDoctorId) ===
                  String(doctorUserId)
                );

                return (
                  String(reviewDoctorId) ===
                  String(doctorUserId)
                );
              }
            );

          console.log(
            'FILTERED REVIEWS:',
            this.reviews
          );
        },

        error: (error) => {

          console.error(
            'Error loading reviews:',
            error
          );
        }

      });
  }


  // GET DOCTOR USER ID
  getDoctorUserId(
    doctor: Doctor
  ): string {

    if (
      typeof doctor.user === 'object'
    ) {
      return doctor.user._id;
    }

    return doctor.user;
  }


  // RATING
  setRating(
    rating: number
  ): void {

    this.selectedRating =
      rating;
  }


  // STARS
  getStars(
    rating: number
  ): number[] {

    return Array.from(
      {
        length: rating
      },
      (_, index) =>
        index + 1
    );
  }


  // GET USER ID
  getUserId(): string | null {

    return (
      this.authService
        .getUser()?._id ?? null
    );
  }


  // CHECK REVIEW OWNER
  canModifyReview(
    review: IReview
  ): boolean {

    const userId =
      this.getUserId();

    if (!userId) {
      return false;
    }

    return (
      review.patient?._id ===
      userId
    );
  }


  // CREATE REVIEW
  submitReview(): void {

    this.reviewMessage = '';

    this.reviewError = '';

    if (!this.isLoggedIn) {

      this.reviewError =
        'Please login first.';

      return;
    }

    if (
      this.selectedRating < 1 ||
      this.selectedRating > 5
    ) {

      this.reviewError =
        'Please select a rating.';

      return;
    }

    if (
      !this.reviewComment.trim()
    ) {

      this.reviewError =
        'Please write a comment.';

      return;
    }

    if (
      this.reviewComment
        .trim()
        .length < 3
    ) {

      this.reviewError =
        'Comment must be at least 3 characters.';

      return;
    }

    if (
      this.reviewComment
        .trim()
        .length > 500
    ) {

      this.reviewError =
        'Comment cannot exceed 500 characters.';

      return;
    }

    const doctor =
      this.doctor();

    if (!doctor) {

      this.reviewError =
        'Doctor information is not available.';

      return;
    }

    const userId =
      this.getUserId();

    if (!userId) {

      this.reviewError =
        'Please login first.';

      return;
    }

    const doctorUserId =
      this.getDoctorUserId(
        doctor
      );

    this.isReviewSubmitting =
      true;

    const reviewData = {

      patient: userId,

      doctor: doctorUserId,

      rating:
        this.selectedRating,

      comment:
        this.reviewComment.trim()
    };

    this.reviewsService
      .createReview(
        reviewData
      )
      .subscribe({

        next: (response) => {

          console.log(
            'CREATED REVIEW:',
            response
          );

          this.selectedRating =
            0;

          this.reviewComment =
            '';

          this.reviewMessage =
            'Your review has been added successfully.';

          this.reviewError =
            '';

          this.isReviewSubmitting =
            false;

          this.loadReviews();
        },

        error: (error) => {

          console.error(
            'ERROR CREATING REVIEW:',
            error
          );

          this.reviewError =
            error?.error?.message ||
            'Could not add your review. Please try again.';

          this.isReviewSubmitting =
            false;
        }

      });
  }


  // START EDIT
  startEdit(
    review: IReview
  ): void {

    this.editingReviewId =
      review._id;

    this.selectedRating =
      review.rating;

    this.reviewComment =
      review.comment;

    this.reviewMessage =
      '';

    this.reviewError =
      '';

    setTimeout(() => {

      document
        .getElementById(
          'review-form'
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

    }, 100);
  }


  // UPDATE REVIEW
  updateReview(): void {

    if (
      !this.editingReviewId
    ) {
      return;
    }

    this.reviewMessage =
      '';

    this.reviewError =
      '';

    if (
      this.selectedRating < 1 ||
      this.selectedRating > 5
    ) {

      this.reviewError =
        'Please select a rating.';

      return;
    }

    if (
      !this.reviewComment.trim()
    ) {

      this.reviewError =
        'Please write a comment.';

      return;
    }

    if (
      this.reviewComment
        .trim()
        .length < 3
    ) {

      this.reviewError =
        'Comment must be at least 3 characters.';

      return;
    }

    if (
      this.reviewComment
        .trim()
        .length > 500
    ) {

      this.reviewError =
        'Comment cannot exceed 500 characters.';

      return;
    }

    this.isReviewSubmitting =
      true;

    const reviewId =
      this.editingReviewId;

    this.reviewsService
      .updateReview(
        reviewId,
        {
          rating:
            this.selectedRating,

          comment:
            this.reviewComment.trim()
        }
      )
      .subscribe({

        next: (response) => {

          console.log(
            'UPDATED REVIEW:',
            response
          );

          const updatedReview =
            response.data;

          this.reviews =
            this.reviews.map(
              (review) =>
                review._id === reviewId
                  ? {
                      ...review,

                      rating:
                        updatedReview.rating,

                      comment:
                        updatedReview.comment,

                      updatedAt:
                        updatedReview.updatedAt
                    }
                  : review
            );

          this.reviewMessage =
            'Your review has been updated successfully.';

          this.reviewError =
            '';

          this.editingReviewId =
            null;

          this.selectedRating =
            0;

          this.reviewComment =
            '';

          this.isReviewSubmitting =
            false;
        },

        error: (error) => {

          console.error(
            'UPDATE REVIEW ERROR:',
            error
          );

          this.reviewError =
            error?.error?.message ||
            'Could not update your review. Please try again.';

          this.isReviewSubmitting =
            false;
        }

      });
  }


  // CANCEL EDIT
  cancelEdit(): void {

    this.editingReviewId =
      null;

    this.selectedRating =
      0;

    this.reviewComment =
      '';

    this.reviewMessage =
      '';

    this.reviewError =
      '';
  }


  // DELETE REVIEW
  deleteReview(
    review: IReview
  ): void {

    this.reviewToDelete =
      review;

    this.showDeleteModal =
      true;
  }


  // CANCEL DELETE
  cancelDelete(): void {

    this.showDeleteModal =
      false;

    this.reviewToDelete =
      null;
  }


  // CONFIRM DELETE
  confirmDelete(): void {

    if (
      !this.reviewToDelete
    ) {
      return;
    }

    const reviewId =
      this.reviewToDelete._id;

    console.log(
      'DELETING REVIEW:',
      reviewId
    );

    this.reviewsService
      .deleteReview(
        reviewId
      )
      .subscribe({

        next: (response) => {

          console.log(
            'DELETE REVIEW RESPONSE:',
            response
          );

          // Remove review immediately
          // from the profile
          this.reviews =
            this.reviews.filter(
              (review) =>
                review._id !==
                reviewId
            );

          // Close modal
          this.showDeleteModal =
            false;

          this.reviewToDelete =
            null;

          // Clear messages
          this.reviewMessage =
            'Review deleted successfully.';

          this.reviewError =
            '';

          // Cancel edit if
          // deleted review was being edited
          if (
            this.editingReviewId ===
            reviewId
          ) {

            this.editingReviewId =
              null;

            this.selectedRating =
              0;

            this.reviewComment =
              '';
          }
        },

        error: (error) => {

          console.error(
            'DELETE REVIEW ERROR:',
            error
          );

          this.reviewError =
            error?.error?.message ||
            'Could not delete your review. Please try again.';

          this.showDeleteModal =
            false;

          this.reviewToDelete =
            null;
        }

      });
  }
}
