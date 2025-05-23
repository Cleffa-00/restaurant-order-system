/*
  Warnings:

  - Added the required column `quantity` to the `OrderItemOption` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OptionType" AS ENUM ('SINGLE_CHOICE', 'MULTI_SELECT', 'QUANTITY');

-- AlterTable
ALTER TABLE "MenuOption" ADD COLUMN     "type" "OptionType" NOT NULL DEFAULT 'SINGLE_CHOICE';

-- AlterTable
ALTER TABLE "OptionTemplate" ADD COLUMN     "type" "OptionType" NOT NULL DEFAULT 'SINGLE_CHOICE';

-- AlterTable
ALTER TABLE "OrderItemOption" ADD COLUMN     "quantity" INTEGER NOT NULL;
