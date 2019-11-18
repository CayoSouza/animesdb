CREATE SEQUENCE animes_anime_id_seq;

CREATE TABLE animes (
                anime_id BIGINT NOT NULL DEFAULT nextval('animes_anime_id_seq'),
                name VARCHAR NOT NULL,
                sinopse VARCHAR NOT NULL,
                score SMALLINT NOT NULL,
                ratings INTEGER NOT NULL,
                season VARCHAR NOT NULL,
                CONSTRAINT anime_id PRIMARY KEY (anime_id)
);
COMMENT ON COLUMN animes.score IS 'média dos scores';
COMMENT ON COLUMN animes.ratings IS 'número de ratings';


ALTER SEQUENCE animes_anime_id_seq OWNED BY animes.anime_id;

CREATE SEQUENCE users_user_id_seq;

CREATE TABLE users (
                user_id BIGINT NOT NULL DEFAULT nextval('users_user_id_seq'),
                email VARCHAR NOT NULL,
                password VARCHAR NOT NULL,
                CONSTRAINT email UNIQUE (email),
                CONSTRAINT user_id PRIMARY KEY (user_id)
);


ALTER SEQUENCE users_user_id_seq OWNED BY users.user_id;

CREATE TABLE rating (
                user_id BIGINT NOT NULL,
                anime_id BIGINT NOT NULL,
                score SMALLINT NOT NULL,
                CONSTRAINT rating_id PRIMARY KEY (user_id, anime_id)
);


ALTER TABLE rating ADD CONSTRAINT anime_rating_fk
FOREIGN KEY (anime_id)
REFERENCES animes (anime_id)
ON DELETE NO ACTION
ON UPDATE NO ACTION
NOT DEFERRABLE;

ALTER TABLE rating ADD CONSTRAINT user_rating_fk
FOREIGN KEY (user_id)
REFERENCES users (user_id)
ON DELETE NO ACTION
ON UPDATE NO ACTION
NOT DEFERRABLE;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public to me;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public to me;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public to me;