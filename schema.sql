CREATE TABLE users (
    id serial primary key,
    name varchar (60) not null,
    email varchar (60) not null
);

CREATE TABLE workoutPost (
    id serial primary key,
    media text not null,
    exercise_type text not null,
    exercise_description text not null,
    user_id integer references users (id)
);

CREATE TABLE likes(
    user_id integer references users (id) on delete cascade,
    post_id integer references workoutPost (id) on delete cascade
);