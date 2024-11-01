export class SignUpDto {
  name: string;
  email: string;
  password: string;
  verification_questions: [
    {
      verificationQuestionId: number;
      answer: string;
    },
  ];
}
