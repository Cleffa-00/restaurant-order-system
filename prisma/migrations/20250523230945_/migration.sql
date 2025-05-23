/*
  Warnings:

  - You are about to drop the column `type` on the `MenuOption` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `OptionTemplate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenuOption" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "OptionTemplate" DROP COLUMN "type";

-- DropEnum
DROP TYPE "OptionType";
