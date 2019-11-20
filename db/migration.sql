CREATE SEQUENCE animes_anime_id_seq;

CREATE TABLE animes (
                anime_id BIGINT NOT NULL DEFAULT nextval('animes_anime_id_seq'),
                name VARCHAR NOT NULL,
                sinopse VARCHAR NOT NULL,
                score NUMERIC(3,2),
                ratings INTEGER,
                season VARCHAR,
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

CREATE TABLE ratings (
                user_id BIGINT NOT NULL,
                anime_id BIGINT NOT NULL,
                score NUMERIC(3,2) NOT NULL,
                CONSTRAINT ratings_id PRIMARY KEY (user_id, anime_id)
);


ALTER TABLE ratings ADD CONSTRAINT anime_ratings_fk
FOREIGN KEY (anime_id)
REFERENCES animes (anime_id)
NOT DEFERRABLE;

ALTER TABLE ratings ADD CONSTRAINT user_ratings_fk
FOREIGN KEY (user_id)
REFERENCES users (user_id)
NOT DEFERRABLE;

CREATE OR REPLACE FUNCTION update_score_and_ratings() 
RETURNS trigger AS $update_score_and_ratings$
BEGIN
    UPDATE animes 
        SET score = (SELECT AVG(score)
                         FROM ratings
                         WHERE anime_id = NEW.anime_id),
            ratings = (SELECT COUNT(*)
                      FROM ratings
                      WHERE anime_id = NEW.anime_id)
        WHERE anime_id = NEW.anime_id;

    RETURN NEW;
END;
$update_score_and_ratings$ LANGUAGE plpgsql;

CREATE TRIGGER rating_added
  AFTER INSERT OR UPDATE OR DELETE
  ON ratings
  FOR EACH ROW
  EXECUTE PROCEDURE update_score_and_ratings();

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public to me;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public to me;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public to me;


INSERT INTO animes (anime_id, name, sinopse)
    VALUES
        (55, 'Full Metal Alchemist', 'troca equivalente'),
        (56, 'Demon Slayer', 'SAAAAI DA FRENTE, SATANÁAAAAAS');

INSERT INTO users (user_id, email, password)
    VALUES
        (55, 'placeholder1@gmail.com', 'placeholder1'),
        (56, 'placeholder2@gmail.com', 'placeholder2');

INSERT INTO ratings (user_id, anime_id, score)
    VALUES
        (55, 55, 3),
        (56, 55, 4);
