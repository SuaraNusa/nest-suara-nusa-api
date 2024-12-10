DROP DATABASE nest_suara_nusa_api;
CREATE DATABASE nest_suara_nusa_api;
USE nest_suara_nusa_api;
SELECT * FROM users;
SELECT * FROM verification_questions;
SELECT * FROM instruments;
SELECT * FROM instrument_resources;
SELECT * FROM users;
UPDATE users SET password = '$2y$10$Ma91i4Az1FfZ.ckGpvxn.eaquOyWtsd.w.6f1duTp/s8FWKDvX6P2' WHERE id = 2;
'0b1a266c-f068-45ff-b64e-9557be5658ab'