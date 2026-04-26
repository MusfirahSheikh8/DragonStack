-- Create trait table if it doesn't already exist
CREATE TABLE IF NOT EXISTS trait (
    id SERIAL PRIMARY KEY,
    "traitType" VARCHAR(64) NOT NULL,
    "traitValue" VARCHAR(64) NOT NULL,
    UNIQUE("traitType", "traitValue")
);

-- Create dragonTrait junction table if it doesn't already exist
CREATE TABLE IF NOT EXISTS "dragonTrait" (
    "dragonId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,
    FOREIGN KEY ("dragonId") REFERENCES dragon(id),
    FOREIGN KEY ("traitId") REFERENCES trait(id),
    PRIMARY KEY ("dragonId", "traitId")
);

-- -- Insert trait data from traits.json
-- INSERT INTO trait ("traitType", "traitValue") VALUES
-- ('backgrounColor', 'black'),
-- ('backgrounColor', 'blue'),
-- ('backgrounColor', 'green'),
-- ('backgrounColor', 'multicolor'),
-- ('backgrounColor', 'white'),
-- ('backgrounColor', 'copper'),
-- ('pattern', 'plain'),
-- ('pattern', 'striped'),
-- ('pattern', 'spotted'),
-- ('build', 'slender'),
-- ('build', 'stocky'),
-- ('build', 'sporty'),
-- ('build', 'skinny'),
-- ('size', 'tiny'),
-- ('size', 'small'),
-- ('size', 'medium'),
-- ('size', 'large'),
-- ('size', 'enormous');
