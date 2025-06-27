# 作業報告書

## 1. 目的

バックエンドアーキテクチャの簡素化を目的とし、`backend` (Go) と `mlService` (Python) に分離していたサービスを、単一のモノリシックなバックエンドに統合する。

## 2. 実施内容

### 2.1. アーキテクチャの分析と計画

- `compose.yml`、`backend`、`mlService` のコードを分析し、現状のアーキテクチャを把握した。
- 問題点として、不要なマイクロサービス化による複雑性の増大と運用オーバーヘッドを特定した。
- 解決策として、`mlService` の機能を `backend` に統合する方針を立て、具体的なタスクを計画した。
- これらの分析結果と計画を `backend_problems.md` にまとめた。

### 2.2. モデルの変換

- `mlService` で使用されていたPyTorch形式のYOLOモデル (`.pt`) を、Go言語からでも利用可能なONNX形式 (`.onnx`) に変換した。
- 変換用のPythonスクリプト (`export_onnx.py`) を作成し、実行した。

### 2.3. Goバックエンドへの統合

- Go言語でONNXモデルを扱うためのライブラリ (`github.com/owulveryck/onnx-go`) を `backend` プロジェクトに導入した。
- 変換済みのONNXモデルファイル (`yolomodel.onnx`, `book.onnx`) を `backend/models/onnx/` ディレクトリに配置した。
- 画像を受け取り、ONNXモデルで推論を行うためのAPIエンドポイント `/detect` を実装した。
    - `controllers/detection_controller.go`: 推論処理の主要ロジックを実装。
    - `routes/detection_route.go`: APIルーティングを定義。
    - `main.go`: 新しいルートを登録。

### 2.4. 機能実装とテスト

- `backend/controllers/detection_controller.go` 内に、推論処理に必要なロジックを実装した。
    1.  **画像のプリプロセッシング**: 入力画像をモデルが要求する形式（640x640のサイズ、ピクセル値の正規化、NCHW形式への変換）に変換する処理。
    2.  **モデル出力のポストプロセッシング**: モデルから出力されたテンソルを解析し、物体のバウンディングボックス、クラスラベル、信頼度スコアに変換し、NMS（Non-Maximum Suppression）を適用する処理。
- `backend/controllers/detection_controller_test.go` のテストコードを修正し、不要で危険なファイルクリーンアップ処理を削除した。

### 2.5. クリーンアップ

- 機能統合が完了したため、不要となった `mlService` ディレクトリをプロジェクトから削除した。

### 2.6. パフォーマンス改善のためのリファクタリング

- `/detect` エンドポイントにおいて、APIリクエストごとにONNXモデルファイルを読み込む非効率な処理があったため、これを修正。
- アプリケーション起動時にモデルを一度だけ読み込み、メモリ上に保持するよう `detection_controller.go` をリファクタリングした。
- 上記の変更に伴い、コントローラーの初期化処理を `main.go` に移動し、関連する `routes/detection_route.go` および `detection_controller_test.go` も修正した。

## 3. 現在の状況

- バックエンドは単一のGoアプリケーションに統合され、`/detect` エンドポイントにおける物体検出機能は完全に実装済みである。
- パフォーマンス改善のためのリファクタリングが完了した。
- 関連するコードの修正とドキュメントの更新は完了した。

## 4. 今後の課題

- 特になし。
