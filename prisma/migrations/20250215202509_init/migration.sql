-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "status" VARCHAR(10),
    "poster" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
