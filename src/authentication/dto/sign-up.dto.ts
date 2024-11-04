type VerificationQuestionDto = {
  verificationQuestionId: number;
  answer: string;
};

export class SignUpDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  verificationQuestions: VerificationQuestionDto[];
}
