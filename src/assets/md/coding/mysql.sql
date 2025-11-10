CREATE DATABASE IF NOT EXISTS todo_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
  
  USE todo_db;
  
  CREATE USER 'todo_user'@'%' IDENTIFIED BY 'todo_task_user';
  
  GRANT ALL PRIVILEGES ON todo_db.* TO 'todo_user'@'%';
  
  FLUSH PRIVILEGES;
  
  use todo_db;
  
  CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_ur_u FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_ur_r FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE oauth2_registered_client (
  id VARCHAR(100) PRIMARY KEY,
  client_id VARCHAR(100) NOT NULL UNIQUE,
  client_id_issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  client_secret VARCHAR(200),
  client_secret_expires_at TIMESTAMP NULL,
  client_name VARCHAR(200) NOT NULL,
  client_authentication_methods VARCHAR(1000) NOT NULL,
  authorization_grant_types VARCHAR(1000) NOT NULL,
  redirect_uris VARCHAR(1000),
  post_logout_redirect_uris VARCHAR(1000),
  scopes VARCHAR(1000),
  client_settings VARCHAR(2000),
  token_settings VARCHAR(2000)
);

CREATE TABLE oauth2_authorization (
  id VARCHAR(100) PRIMARY KEY,
  registered_client_id VARCHAR(100) NOT NULL,
  principal_name VARCHAR(200) NOT NULL,
  authorization_grant_type VARCHAR(100) NOT NULL,
  authorized_scopes VARCHAR(1000),
  attributes TEXT,
  state VARCHAR(500),
  authorization_code_value BLOB,
  authorization_code_issued_at TIMESTAMP NULL,
  authorization_code_expires_at TIMESTAMP NULL,
  authorization_code_metadata TEXT,
  access_token_value BLOB,
  access_token_issued_at TIMESTAMP NULL,
  access_token_expires_at TIMESTAMP NULL,
  access_token_metadata TEXT,
  access_token_type VARCHAR(100),
  access_token_scopes VARCHAR(1000),
  oidc_id_token_value BLOB,
  oidc_id_token_issued_at TIMESTAMP NULL,
  oidc_id_token_expires_at TIMESTAMP NULL,
  oidc_id_token_metadata TEXT,
  refresh_token_value BLOB,
  refresh_token_issued_at TIMESTAMP NULL,
  refresh_token_expires_at TIMESTAMP NULL,
  refresh_token_metadata TEXT,
  user_code_value BLOB,
  user_code_issued_at TIMESTAMP NULL,
  user_code_expires_at TIMESTAMP NULL,
  user_code_metadata TEXT,
  device_code_value BLOB,
  device_code_issued_at TIMESTAMP NULL,
  device_code_expires_at TIMESTAMP NULL,
  device_code_metadata TEXT
);

CREATE TABLE oauth2_authorization_consent (
  registered_client_id VARCHAR(100) NOT NULL,
  principal_name VARCHAR(200) NOT NULL,
  authorities VARCHAR(1000) NOT NULL,
  PRIMARY KEY (registered_client_id, principal_name)
);

INSERT INTO roles(name) VALUES ('ROLE_USER') ON DUPLICATE KEY UPDATE name=name;

INSERT INTO oauth2_registered_client(
  id, client_id, client_name,
  client_authentication_methods,
  authorization_grant_types,
  redirect_uris, post_logout_redirect_uris,
  scopes, client_settings, token_settings
) VALUES (
  'spa-1',
  'todo-angular-spa',
  'Todo Angular SPA',
  'none',
  'authorization_code,refresh_token',
  'http://localhost:4200/auth/callback',
  'http://localhost:4200/login',
  'openid,profile,email,todo.read,todo.write',
  '{"settings.client.require-proof-key":true,"settings.client.require-authorization-consent":false}',
  '{"settings.token.access-token-time-to-live":"PT15M","settings.token.refresh-token-time-to-live":"P7D","settings.token.reuse-refresh-tokens":false}'
)
ON DUPLICATE KEY UPDATE client_name=VALUES(client_name);

select * from users;

CREATE TABLE IF NOT EXISTS todos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,                               -- from JWT claim 'uid'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('NEW','IN_PROGRESS','DONE','BLOCKED') DEFAULT 'NEW',
  priority ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_todos_user (user_id),
  INDEX idx_todos_status (status),
  INDEX idx_todos_due (due_date)
);

INSERT INTO todos (user_id, title, description, priority, status, due_date)
VALUES
(1, 'Sample Todo', 'Remove this later', 'MEDIUM', 'NEW', CURDATE()+INTERVAL 3 DAY)
ON DUPLICATE KEY UPDATE title=VALUES(title);
  
SELECT client_id, redirect_uris, client_settings
FROM oauth2_registered_client
WHERE client_id='todo-angular-spa';
  
-- DELETE FROM oauth2_registered_client WHERE client_id = 'todo-angular-spa';