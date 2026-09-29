# 古門研究室 / Furukado Lab Website

GitHub Pages用の静的サイトです。

## 含まれるページ
- Home
- Research
- Projects
- JKA Research
- Publications
- Grants & Funding
- Student Research
- Profile
- Contact

## 自動更新
`.github/workflows/update-researchmap.yml` が毎月1回、researchmap APIから以下を取得し `data/researchmap.json` を更新します。
- 論文
- 書籍等出版物
- 講演・口頭発表等
- 受賞
- 共同研究・競争的資金等の研究課題

手動更新も GitHub > Actions > Update researchmap data > Run workflow から実行できます。

## JKA
2024年度 JKA補助事業 2024P-422 の公開資料を `assets/jka/` に保存しています。
内部資料（自己評価書Excel等）は含めていません。

## 学生研究
`data/student-research.json` にR2〜R7の研究テーマを格納しています。
PDF原稿そのものや学籍番号は公開しません。

## Footer
大学名はフッターに表示していません。
`© Furukado Lab` のみです。
