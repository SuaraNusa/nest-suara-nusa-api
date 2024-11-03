type VerificationQuestionDto = {
  verificationQuestionId: number;
  answer: string;
};

export class SignUpDto {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  verification_questions: VerificationQuestionDto[];
}
