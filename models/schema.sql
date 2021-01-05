CREATE TABLE users (
    id serial primary key,
    name varchar (60),
    email varchar (60) not null,
    pic_path varchar,
    about_me varchar,
    password varchar (60) not null
);

CREATE TABLE workoutPost (
    id serial primary key,
    path text not null,
    exercise_type text not null,
    exercise_description text not null,
    created_at date DEFAULT CURRENT_DATE,
    user_id integer references users (id)
);

CREATE TABLE likes(
    user_id integer references users (id) on delete cascade,
    post_id integer references workoutPost (id) on delete cascade
);

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");
