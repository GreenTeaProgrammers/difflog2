# frontend/Dockerfile

FROM node:latest

WORKDIR /app

# package.json と package-lock.json をコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# ビルドと起動
RUN npm run build
CMD ["npm", "run", "dev"]

EXPOSE 3000
