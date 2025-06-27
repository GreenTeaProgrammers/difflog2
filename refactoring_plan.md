# Next.js & shadcn/ui リファクタリング計画

## 概要
既存のVite + Reactベースのフロントエンドを、Next.jsとshadcn/uiをベースとしたモダンな構成にリファクタリングする。

## フェーズ1: Next.jsプロジェクトのセットアップと基本構成の移行

1.  **新しいNext.jsプロジェクトの作成:**
    *   `create-next-app` を使用して、新しいNext.jsプロジェクト (`frontend-next`) を作成する。
    *   TypeScript, ESLint, Tailwind CSS を初期設定に含める。
2.  **shadcn/uiのセットアップ:**
    *   作成したNext.jsプロジェクトに `shadcn/ui` を導入する。
3.  **ディレクトリ構造の設計:**
    *   Next.jsの `app` Routerをベースに、`components`, `lib`, `utils`, `services` などのディレクトリを設計する。
4.  **静的ファイルの移行:**
    *   `public` ディレクトリ内の静的ファイルを新しいプロジェクトに移行する。
5.  **環境変数の設定:**
    *   既存の環境変数をNext.jsの `.env.local` に移行する。

## フェーズ2: UIコンポーネントの段階的な移行と置き換え

1.  **MUIからshadcn/uiへの置き換え:**
    *   既存のMUIコンポーネントを、shadcn/uiのコンポーネントに置き換える。
    *   代替がないコンポーネントは、ラッパーとして利用するか、代替ライブラリを検討する。
2.  **既存コンポーネントの移行とリファクタリング:**
    *   既存のReactコンポーネントを新しいプロジェクトに移行し、`"use client"` を適切に追加する。
    *   スタイリングをTailwind CSSにリファクタリングする。

## フェーズ3: ルーティングとデータ取得ロジックの移行

1.  **ルーティングの移行:**
    *   `react-router-dom` のルートを、Next.jsの `app` Routerに置き換える。
    *   認証ガードはNext.jsのMiddlewareで再実装する。
2.  **データ取得ロジックの移行:**
    *   `axios` でのAPIリクエストを、Next.jsのデータ取得方法（Server Actions, Route Handlersなど）に置き換える。
3.  **状態管理の移行:**
    *   Redux Toolkitで管理している状態を見直し、SWR, Zustand, Context APIなどへの移行を検討する。

## フェーズ4: 認証とデプロイ

1.  **認証機能の再実装:**
    *   認証ロジックをNext.js環境で再実装する（NextAuth.jsの導入を検討）。
2.  **ビルドとデプロイ設定:**
    *   `compose.yml` や `Dockerfile` を更新し、Next.jsアプリケーションをデプロイできるようにする。
3.  **最終テストと旧フロントエンドの置き換え:**
    *   E2Eテストなどを実施し、問題がなければ旧プロジェクトを置き換える。
