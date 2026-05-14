-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('COFFEE', 'SNACK', 'ENERGY_DRINK', 'TESTING', 'DEPLOY', 'ROLLBACK', 'HOTFIX');

-- CreateEnum
CREATE TYPE "public"."Unit" AS ENUM ('UNIT', 'KG', 'LITER', 'PACKAGE');

-- CreateEnum
CREATE TYPE "public"."Criticality" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."ItemStatus" AS ENUM ('AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "public"."MovementType" AS ENUM ('IN', 'OUT');

-- CreateTable
CREATE TABLE "public"."CafeItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "public"."Category" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "unit" "public"."Unit" NOT NULL,
    "criticality" "public"."Criticality" NOT NULL,
    "status" "public"."ItemStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CafeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StockMovement" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" "public"."MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "responsible" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."CafeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
