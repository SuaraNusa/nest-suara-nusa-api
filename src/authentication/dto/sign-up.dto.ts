export class SignUpDto {
  name: string;
  email: string;
  password: string;
  verification_questions: [
    {
      question_id: number;
      answer: string;
    },
  ];
}
