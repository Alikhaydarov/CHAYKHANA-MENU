import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
const databasePath = process.env.DATABASE_PATH
  ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
  : path.join(dataDir, "chaykahana.db");
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS dishes (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 category TEXT NOT NULL,
 price INTEGER NOT NULL DEFAULT 0,
 image TEXT NOT NULL,
 visible INTEGER NOT NULL DEFAULT 1,
 position INTEGER NOT NULL DEFAULT 0,
 names TEXT NOT NULL,
 descriptions TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);
const count = db.prepare("SELECT COUNT(*) c FROM dishes").get().c;
if (!count) {
 const insert = db.prepare("INSERT INTO dishes(category,price,image,visible,position,names,descriptions) VALUES(?,?,?,?,?,?,?)");
 const rows = [
  ["Osh",13000,"/assets/osh.png",1,1,{uz:"Osh",ko:"오시",ru:"Плов",en:"Plov"},{uz:"An’anaviy o‘zbek palovi",ko:"전통 우즈베크 플로브",ru:"Традиционный узбекский плов",en:"Traditional Uzbek plov"}],
  ["Manti",10000,"/assets/manti.png",1,2,{uz:"Manti",ko:"만티",ru:"Манты",en:"Manti"},{uz:"Bug‘da pishirilgan go‘shtli manti",ko:"찐 고기 만두",ru:"Манты с мясом на пару",en:"Steamed meat dumplings"}],
  ["Lag‘mon",9000,"/assets/lagman.png",1,3,{uz:"Lag‘mon",ko:"라그만",ru:"Лагман",en:"Lagman"},{uz:"Qo‘lda cho‘zilgan ugra va go‘sht",ko:"수타면과 소고기",ru:"Домашняя лапша с мясом",en:"Hand-pulled noodles with beef"}],
  ["Osh",14000,"/assets/osh.png",1,4,{uz:"Qarshi palovi",ko:"카르시 플로브",ru:"Каршинский плов",en:"Karshi plov"},{uz:"Qarshi usulidagi palov",ko:"카르시식 플로브",ru:"Плов по-каршински",en:"Karshi-style plov"}],
  ["Manti",11000,"/assets/manti.png",0,5,{uz:"Qovurma manti",ko:"튀긴 만티",ru:"Жареные манты",en:"Fried manti"},{uz:"Qizartirib pishirilgan manti",ko:"바삭한 튀김 만티",ru:"Хрустящие жареные манты",en:"Crispy fried manti"}],
 ];
 const tx=db.transaction(()=>rows.forEach(r=>insert.run(r[0],r[1],r[2],r[3],r[4],JSON.stringify(r[5]),JSON.stringify(r[6])))); tx();
}
export function mapDish(row){return {...row,visible:Boolean(row.visible),names:JSON.parse(row.names),descriptions:JSON.parse(row.descriptions)}}
export default db;
