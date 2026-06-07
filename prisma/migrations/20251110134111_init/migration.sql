/*
  Warnings:

  - You are about to alter the column `name` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - Added the required column `code` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" REAL NOT NULL,
    "chineseName" TEXT NOT NULL,
    "minStock" INTEGER NOT NULL,
    "uom" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "imageUrl" TEXT
);
INSERT INTO "new_Product" ("chineseName", "id", "imageUrl", "minStock", "name", "uom") SELECT "chineseName", "id", "imageUrl", "minStock", "name", "uom" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
