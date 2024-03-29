export default {
    NULL_VALUE: "필요한 값이 없습니다.",
    OUT_OF_VALUE: "파라미터 값이 잘못되었습니다.",
    NOT_FOUND: "잘못된 경로입니다.",
    BAD_REQUEST: "잘못된 요청입니다.",

    // auth
    SIGNUP_SUCCESS: "회원 가입 성공",
    SIGNUP_FAIL: "회원 가입 실패",
    SIGNIN_SUCCESS: "로그인 성공",
    SIGNIN_FAIL: "로그인 실패",
    ALREADY_NICKNAME: "이미 사용중인 닉네임입니다.",
    ALREADY_EMAIL: "이미 사용중인 이메일입니다.",
    SOCIAL_SIGNIN_SUCCESS: "소셜 로그인 성공",
    SOCIAL_SIGNUP_SUCCESS: "소셜 회원가입 성공",
    CHECK_KAKAO_USER_SUCCESS: "카카오 계정 확인 성공",
    CHECK_KAKAO_USER_FAIL: "카카오 계정 확인 실패",
    ALREADY_USER: "이미 회원가입 된 유저입니다.",
    REFRESH_FAIL: "토큰 갱신 실패",
    // user
    READ_USER_SUCCESS: "유저 조회 성공",
    READ_USER_FAIL: "유저 조회 실패",
    READ_ALL_USERS_SUCCESS: "모든 유저 조회 성공",
    UPDATE_USER_SUCCESS: "사용가능한 닉네임입니다",
    UPDATE_USER_FAIL: "중복되는 닉네임입니다",
    DELETE_USER_SUCCESS: "유저 탈퇴 성공",
    DELETE_USER_FAIL: "유저 탈퇴 실패",
    NO_USER: "탈퇴했거나 가입하지 않은 유저입니다.",
    NOT_SIGNUP_SOCIAL_USER: "아직 회원가입하지 않은 소셜 유저입니다.",
    IS_SOCIAL_USER: "회원가입 된 소셜 유저입니다",
    NO_SOCIAL_USER: "소셜 서비스에 가입하지 않은 유저입니다",
    NO_SOCIAL_TYPE: "제공하는 소셜 서비스가 다릅니다.",
    SOCIAL_LOGIN_SUCCESS: "소셜 로그인 성공",
    INVALID_PASSWORD: "잘못된 비밀번호입니다.",
    INVALID_EMAIL: "잘못된 이메일입니다.",
    CANT_GET_USERINFO: "유저 아이디를 갖고올 수 없습니다.",
    GET_USER_INFO: "유저 정보 갖고오기 성공",
    UNIQUE_USER_NAME: "중복 검사 완료! 중복되는 이름이 없습니다. ",
    UNIQUE_USER_EMAIL: "중복 검사 완료! 중복되는 이메일이 없습니다. ",
    USER_NAME_DUPLICATE: "중복된 아이디가 있습니다.",
    USER_EMAIL_DUPLICATE: "중복된 이메일이 있습니다.",

    // token
    CREATE_TOKEN_SUCCESS: "토큰 재발급 성공",
    EXPIRED_TOKEN: "토큰이 만료되었습니다.",
    EXPIRED_REFRESH_TOKEN: "리프레시 토큰이 만료되었습니다.",
    EXPIRED_ALL_TOKEN: "모든 토큰이 만료되었습니다.",
    INVALID_TOKEN: "유효하지 않은 토큰입니다.",
    INVALID_REFRESH_TOKEN: "유효하지 않은 리프레시 토큰입니다.",
    VALID_ACCESS_TOKEN: "유효한 엑세스 토큰입니다.",
    EMPTY_TOKEN: "토큰 값이 없습니다.",
    NOT_TOKEN_OWNER: "본인의 토큰이 아닙니다.",

    // vote
    CREATE_VOTE_SUCCESS: "투표 생성 성공",
    CREATE_VOTE_FAIL: "투표 생성 실패",
    NOT_TWO_PICTURES: "두장의 파일을 업로드 해주세요, 사진 업로드 개수 오류 ",
    NOT_ONE_PICTURE: "한 장의 파일을 업로드 해주세요, 사진 업로드 개수 오류",
    CREATE_PICTURE_FAIL: "투표 내 사진 저장 실패",
    NO_CURRENT_VOTE: "현재 진행중인 투표들 없음[null] ",
    GET_VOTE_FAIL: "사진과 스티커 갖고오기 실패",
    CLOSE_VOTE_FAIL: "투표 종료 실패",
    CLOSE_VOTE_SUCCESS: "투표 종료 성공",
    ALREADY_CLOSED_VOTE: "이미 종료된 투표입니다.",
    VOTE_NOT_EXIST: "투표가 존재하지 않습니다",
    VOTE_NOT_ADMIN: "본인의 투표가 아닙니다",
    PLAYER_GET_VOTE_FAIL: "해당하는 투표가 없습니다.",
    PLAYER_GET_VOTE_RESULT_FAIL: "투표 결과를 받아올 수 없습니다.",
    PLAYER_GET_VOTE_SUCCESS: "투표 결과를 갖고 왔습니다.",
    PLAYER_VOTE_ALREADY_END: "이미 투표가 끝났습니다.",
    PLAYER_GET_VOTE_PICTURE_SUCCESS: "꽃 투표 관련 사진을 갖고 왔습니다",
    PLAYER_GET_VOTE_PICTURE_FAIL: "꽃 투표 관련 사진을 갖고 올 수 없습니다.",
    NOT_VOTE_ID: "해당 투표 아이디가 존재하지 않습니다.",
    DELETE_VOTE_SUCCESS: "투표가 삭제되었습니다.",
    DELETE_VOTE_FAIL: "투표 삭제 실패",
    VOTE_USER_NOT_EQUAL: "투표 사용자의 투표가 아닙니다.",
    PLAYER_GET_VOTED_RESULT_SUCCESS: "투표와 스티커 가져오기를 성공 했습니다.",
    CURRENT_DATA_END: "더이상 데이터가 없습니다.",
    LIBRARY_GET_SUCCESS: "라이브러리 조회 성공",
    LIBRARY_NO_DATA: "저장된 투표가 없습니다.",
    LIBRARY_GET_FAIL: "라이브러리 조회 실패",
    INF_SCROLL_SUCCESS: "무한 스크롤 성공",
    INF_SCROLL_FAIL: "무한 스크롤 실패",
    INF_SCROLL_END: "더이상 데이터가 없습니다.",

    //sticker
    CREATE_STICKER_SUCCESS: "스티커 생성 성공",
    STICKER_COUNT_EXCEED: "스티커 개수가 초과되었습니다.",
    STICKER_TRANSCTION_FAIL: "스티커 트랜잭션 실패",
    PICTURE_NOT_EXIST: "사진이 없습니다.",

    // server error
    INTERNAL_SERVER_ERROR: "서버 내 오류",

    // transaction fail
    TRANSACTION_FAILED: "트랜잭션 실패",

    //alarm
    PUSH_NOTIFICATION_SUCCESS: "알람 전송 성공",
    PUSH_NOTIFICATION_FALED: "알람 전송 실패",
    PUSH_NOTIFICATION_REGISTER_SUCCESS: "유저 구독 성공",
    PUSH_NOTIFICATION_REGISTER_FALED: "유저 구독 실패",
};
