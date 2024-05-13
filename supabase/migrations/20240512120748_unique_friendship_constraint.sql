ALTER TABLE friends ADD CONSTRAINT unique_friendship_request UNIQUE (profile, friend);
