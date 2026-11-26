// Simulasi Database Master dari Excel (Factory 1)
const MASTER_PARTS = [
  // FINAL BALL / FINISH BALL (GOLF BALL)
  { category: "Final Ball", part_name: "2P420 WH2[DL_S] (1)", part_no: "FG15SR244B", core: "E-7974-B", resin: "SP-428-H", unit: "DOZEN", item: "GOLF BALL" },
  { category: "Finish Ball", part_name: "DDH TS RB3 (15)", part_no: "FG15TS039B", core: "E-1234-A", resin: "SP-100-X", unit: "DOZEN", item: "GOLF BALL" },
  { category: "Core Ball", part_name: "MZ 20D201 WH (12)", part_no: "FGB15MZ019", core: "E-555-C", resin: "SP-999-Y", unit: "DOZEN", item: "GOLF BALL" },
  { category: "Final Ball", part_name: "SI SF LADY9 WH (12)", part_no: "FGB15SR673", core: "E-7974-B", resin: "SP-428-H", unit: "DOZEN", item: "GOLF BALL" },
  { category: "Final Ball", part_name: "SI SF13 WH (12)", part_no: "FGB15SR600", core: "E-1122-C", resin: "SP-222-D", unit: "DOZEN", item: "GOLF BALL" },
  { category: "Final Ball", part_name: "SI SF14 WH (12)", part_no: "FGB15SR660", core: "E-3344-F", resin: "SP-111-G", unit: "DOZEN", item: "GOLF BALL" },
  { category: "Final Ball", part_name: "SI AD333 11 WH (12)", part_no: "FGB15SR640", core: "E-7788-A", resin: "SP-555-K", unit: "DOZEN", item: "GOLF BALL" },
  { category: "Finish Ball", part_name: "DDH TS SF2 WH[KR] (12)", part_no: "FGB15TS066", core: "E-4321-A", resin: "SP-987-X", unit: "DOZEN", item: "GOLF BALL" },
  
  // PACKAGING (CARTON BOX, PACKAGING TOP, SLEEVE, DLL)
  { category: "Packaging", part_name: "CB SI SF15 TL BRD (12)", part_no: "RGB12CA621", core: "-", resin: "-", unit: "PCS", item: "CARTON BOX" },
  { category: "Packaging", part_name: "CB SI SF13 WH (12)", part_no: "RGB12CA543", core: "-", resin: "-", unit: "PCS", item: "CARTON BOX" },
  { category: "Packaging", part_name: "CB SI ZS8 NONO WH (12)", part_no: "RGB12CA556", core: "-", resin: "-", unit: "PCS", item: "CARTON BOX" },
  { category: "Packaging", part_name: "OT SI SF13 WH (12)", part_no: "RGB12DA543", core: "-", resin: "-", unit: "PCS", item: "PACKAGING TOP" },
  { category: "Packaging", part_name: "OT SI ZS8 WH [_S] (12)", part_no: "RGB12DA552", core: "-", resin: "-", unit: "PCS", item: "PACKAGING TOP" },
  { category: "Packaging", part_name: "OB SF13 SERIES (12)", part_no: "RGB12DB543", core: "-", resin: "-", unit: "PCS", item: "PACKAGING BOTTOM" },
  { category: "Packaging", part_name: "GA SI SF13 WH -3PC", part_no: "RGB12GA543", core: "-", resin: "-", unit: "PCS", item: "PACKAGING SLEEVE" },
  { category: "Packaging", part_name: "BOX SI ZS8 PP WH (6)", part_no: "RGB12DO560", core: "-", resin: "-", unit: "PCS", item: "PACKAGING TOP" },
  { category: "Packaging", part_name: "OB SI Z-STAR9 SERIES (12)", part_no: "RGB12DB584", core: "-", resin: "-", unit: "PCS", item: "PACKAGING BOTTOM" },

  // MOLD / SPARE PART
  { category: "Mold", part_name: "Injection Mold EZGB1690 MD-403", part_no: "EZGB1690", core: "-", resin: "-", unit: "SET", item: "MOLD" },
  { category: "Mold", part_name: "Injection Mold ZGB1324 MD-203", part_no: "ZGB1324", core: "-", resin: "-", unit: "SET", item: "MOLD" },
  { category: "Mold", part_name: "Press Mold ZGB0057 64N-111", part_no: "ZGB0057", core: "-", resin: "-", unit: "SET", item: "MOLD" }
];

const MASTER_SUPPLIERS = [
  { id: "SRI00002", name: "SUMITOMO RUBBER INDUSTRIES, LTD.", pic: "YUKO KUROKI", address: "SPORTS BUSINESS HEADQUARTERS. 6-9, 3-CHOME, WAKINOHAMA-CHO, CHUO-KU, KOBE-CITY 651-0072, JAPAN" },
  { id: "SRI00003", name: "SUMITOMO RUBBER INDUSTRIES, LTD.", pic: "YUKO KUROKI / SUPPLY CHAIN MANAGEMENT DEPT.", address: "SPORTS BUSINESS HEADQUARTERS. 6-9, 3-CHOME, WAKINOHAMA-CHO, CHUO-KU, KOBE-CITY 651-0072, JAPAN" },
  { id: "SUM001", name: "SUMITOMO RUBBER INDUSTRIES, LTD.", pic: "Sample to KOBE", address: "SPORTS BUSINESS HEADQUARTERS. 1-1,2-CHOME, TSUTSUI-CHO, CHUO-KU, KOBE 651-0072, JAPAN" },
  { id: "SUM002", name: "SUMITOMO RUBBER INDUSTRIES, LTD.", pic: "Sample to HYOUGO", address: "SPORTS BUSINESS HEADQUARTERS. 5 KAJIWARA, ICHIJIMA-CHO, TANBA CITY, HYOUGO 669-4323, JAPAN" },
  { id: "SUM003", name: "SUMITOMO RUBBER INDUSTRIES, LTD.", pic: "Assistant Manager Takuya Ono", address: "SPORTS BUSINESS HEADQUARTERS. 3-6-9 WAKINOHAMA-CHO, CHUO-KU, KOBE-CITY 651-0072, JAPAN" }
];
