-- CreateTable
CREATE TABLE "PlayerStatistics" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "tournamentsEntered" INTEGER NOT NULL DEFAULT 0,
    "tournamentsCompleted" INTEGER NOT NULL DEFAULT 0,
    "titles" INTEGER NOT NULL DEFAULT 0,
    "finals" INTEGER NOT NULL DEFAULT 0,
    "semifinals" INTEGER NOT NULL DEFAULT 0,
    "rankingPoints" INTEGER NOT NULL DEFAULT 0,
    "currentRanking" INTEGER,
    "bestRanking" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStatistics_playerId_key" ON "PlayerStatistics"("playerId");

-- CreateIndex
CREATE INDEX "PlayerStatistics_rankingPoints_idx" ON "PlayerStatistics"("rankingPoints");

-- CreateIndex
CREATE INDEX "PlayerStatistics_currentRanking_idx" ON "PlayerStatistics"("currentRanking");

-- AddForeignKey
ALTER TABLE "PlayerStatistics" ADD CONSTRAINT "PlayerStatistics_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
