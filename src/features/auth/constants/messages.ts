export const AUTH_MESSAGES = {
  USERNAME_FORMAT:
    '아이디는 5~20자 이내의 영어 소문자(a-z), 숫자(0-9), 특수문자(_, -)로 구성되어야 합니다.',
  NICKNAME_FORMAT:
    '닉네임은 한글 포함 시 10자 이내, 영문/숫자 30자 이내로 구성되어야 합니다.',
  PASSWORD_FORMAT:
    '비밀번호는 8~20자 이내의 영문자, 숫자, 특수문자로 구성되어야 합니다.',
  CONFIRM_PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.',

  USERNAME_DUPLICATE: '이미 사용 중인 아이디입니다.',
  NICKNAME_DUPLICATE: '이미 사용 중인 닉네임입니다.',

  SIGNUP_GENERAL_FAILURE: '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.',
} as const;
