-- test 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS 'test'
USE 'test';

-- 테이블 test.memo 구조 내보내기
CREATE TABLE 'channel' (
  'name' TEXT NULL,
  'address' TEXT NULL,
  'content' TEXT NULL,
  'platform' TEXT NULL,
  'introduction' TEXT NULL,
  'filename' TEXT NULL
)
COMMENT = '홍보 서비스 등록시 입력한 데이터'
COLLATE = 'utf8mb4_0900_ai_ci'
ENGINE = InnoDB
;
    