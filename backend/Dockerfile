# 1. ベースイメージを最新バージョンで指定
FROM golang:latest AS builder

# 2. 作業ディレクトリを設定
WORKDIR /app

# 3. Goモジュールを初期化して依存関係をインストール
COPY go.mod go.sum ./
RUN go mod download

# 4. アプリケーションのソースコードをコピー
COPY . .

# 5. アプリケーションをビルド
RUN CGO_ENABLED=0 GOOS=linux go build -o main . 

# 6. 軽量なAlpine Linuxイメージをベースイメージとして指定
FROM alpine:latest

WORKDIR /app

# 7. builder stageで生成したGoのバイナリファイルをApline Linuxのイメージにコピー
COPY --from=builder /app/main /app/main

# 8. 必要なポートを公開
EXPOSE 8080

# 9. アプリケーションを起動
CMD ["./main"]
