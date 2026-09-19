
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ContactService,
  ContactMessage
} from '../../services/contact.service';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './messages-list.component.html'
})
export class MessagesListComponent implements OnInit {

  messages: ContactMessage[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.contactService.getAll().subscribe({

      next: (res) => {
        this.isLoading = false;

        if (res.success) {
          this.messages = res.data || [];
        } else {
          this.errorMessage =
            res.message || 'Failed to load messages.';
        }
      },

      error: (err: unknown) => {
        this.isLoading = false;

        console.error('Load messages error:', err);

        this.errorMessage =
          'Failed to load messages.';
      }
    });
  }

  markAsRead(message: ContactMessage): void {

    if (message.status === 'Read') {
      return;
    }

    this.contactService
      .updateStatus(message._id, 'Read')
      .subscribe({

        next: (res) => {

          if (res.success) {
            message.status = 'Read';
          }
        },

        error: (err: unknown) => {
          console.error('Update status error:', err);
        }
      });
  }

  markAsResponded(message: ContactMessage): void {

    this.contactService
      .updateStatus(message._id, 'Responded')
      .subscribe({

        next: (res) => {

          if (res.success) {
            message.status = 'Responded';
          }
        },

        error: (err: unknown) => {
          console.error('Update status error:', err);
        }
      });
  }

  deleteMessage(id: string): void {

    const confirmed = confirm(
      'Are you sure you want to delete this message?'
    );

    if (!confirmed) {
      return;
    }

    this.contactService
      .delete(id)
      .subscribe({

        next: (res) => {

          if (res.success) {
            this.messages =
              this.messages.filter(
                message => message._id !== id
              );
          }
        },

        error: (err: unknown) => {
          console.error('Delete message error:', err);
        }
      });
  }

  getStatusClass(status: ContactMessage['status']): string {

    switch (status) {

      case 'New':
        return 'status-new';

      case 'Read':
        return 'status-read';

      case 'Responded':
        return 'status-responded';

      default:
        return '';
    }
  }
}

