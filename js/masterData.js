// Simulasi Database Master dari Excel
const MASTER_PARTS = [
  { category: "Final Ball", part_name: "2P420 WH2[DL_S] (1)", part_no: "FG15SR244B", core: "E-7974-B", resin: "SP-428-H", unit: "DOZEN", item: "GOLF BALL" },
  { category: "Finish Ball", part_name: "DDH TS RB3 (15)", part_no: "FG15TS039B", core: "E-1234-A", resin: "SP-100-X", unit: "DOZEN", item: "GOLF BALL" },
  { category: "Core Ball", part_name: "MZ 20D201 WH (12)", part_no: "FGB15MZ019", core: "E-555-C", resin: "SP-999-Y", unit: "DOZEN", item: "GOLF BALL" },
  { category: "Packaging", part_name: "CB SI SF15 TL BRD (12)", part_no: "RGB12CA621", core: "-", resin: "-", unit: "PCS", item: "CARTON BOX" },
  { category: "Packaging", part_name: "OT SI SF13 WH (12)", part_no: "RGB12DA543", core: "-", resin: "-", unit: "PCS", item: "PACKAGING TOP" },
  // TAMBAHKAN DATA EXCEL LAINNYA DI SINI
];

const MASTER_SUPPLIERS = [
  { id: "SRI00002", name: "SUMITOMO RUBBER INDUSTRIES, LTD.", pic: "YUKO KUROKI", address: "SPORTS BUSINESS HEADQUARTERS. 6-9, 3-CHOME, WAKINOHAMA-CHO, CHUO-KU, KOBE-CITY 651-0072, JAPAN" },
  { id: "SRI00003", name: "SUMITOMO RUBBER INDUSTRIES, LTD.", pic: "YUKO KUROKI / SUPPLY CHAIN MANAGEMENT DEPT.", address: "SPORTS BUSINESS HEADQUARTERS. 6-9, 3-CHOME, WAKINOHAMA-CHO, CHUO-KU, KOBE-CITY 651-0072, JAPAN" },
  { id: "SUM001", name: "SUMITOMO RUBBER INDUSTRIES, LTD.", pic: "Sample to KOBE", address: "SPORTS BUSINESS HEADQUARTERS. 1-1,2-CHOME, TSUTSUI-CHO, CHUO-KU, KOBE 651-0072, JAPAN" }
];
