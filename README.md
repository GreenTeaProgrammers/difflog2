# difflog2

## HackU 2024 Tokyo@vol2の作品

## 概要
「変化を記録しよう！」をコンセプトに作成された本ウェブアプリは、日常の変化を記録していきます。
具体的には、カメラで写真を撮る、投稿すると、前回との差分を記録し、変化として残すことができます。
使い道は、とってもたくさん！ぜひ、みなさん独自の使い道を考えてみてください！

## 構成
- Next.js (App Router)
- Prisma + MySQL
- MinIO (S3互換ストレージ)
- 機械学習の推論は当面無効化し、手動入力前提

## 開発
- `docker compose up --build`
- 環境変数は `frontend-next/.env.example` を参照
