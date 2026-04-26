CREATE TABLE "dragonTrait" (
    "dragonId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,
    FOREIGN KEY ("dragonId") REFERENCES dragon(id),
    FOREIGN KEY ("traitId") REFERENCES trait(id),
    PRIMARY KEY ("dragonId", "traitId")
);
