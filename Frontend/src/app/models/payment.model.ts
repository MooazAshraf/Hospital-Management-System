export interface Payment {
  _id: string;

  appointment: any;

  patient: {
    _id: string;
    name: string;
    email: string;
  };

  amount: number;

  method: 'Cash' | 'VodafoneCash' | 'InstaPay' | 'ECash';

  status: 'Pending' | 'Paid' | 'Failed';

  transactionId: string;

  senderPhone?: string | null;

  instapayUsername?: string | null;

  paidAt?: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}
