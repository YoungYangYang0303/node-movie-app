# Node.js + Next.js 电影应用 (Movie App)

这是一个全栈电影应用程序，后端使用 Node.js 和 Express 构建，前端使用 Next.js 和 React 构建。该应用允许用户浏览电影、查看详情、进行用户认证（注册/登录）、发表评论以及收藏喜欢的电影。

## 🛠️ 技术栈

- **后端**:
  - Node.js
  - Express.js
  - MySQL (数据库)
  - JSON Web Tokens (JWT) (认证)
  - BCrypt (密码加密)

- **前端**:
  - Next.js (React 框架)
  - React Hooks
  - CSS Modules (样式)

## ✨ 功能特性

- **用户认证**: 注册和登录功能，使用 JWT 进行安全验证。
- **电影浏览**: 浏览电影列表，支持分页和搜索。
- **电影详情**: 查看电影的详细信息。
- **评论系统**: 登录用户可以对电影发表评论。
- **收藏功能**: 登录用户可以收藏喜欢的电影。

## 📋 前置要求

在开始之前，请确保您的开发环境中安装了以下工具：

- [Node.js](https://nodejs.org/) (建议 v16 或更高版本)
- [MySQL](https://www.mysql.com/) 数据库

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd node-movie-app
```

### 2. 后端设置 (Backend)

进入 `backend` 目录并安装依赖：

```bash
cd backend
npm install
```

**配置环境变量**:

在 `backend` 目录下创建一个 `.env` 文件，并添加以下配置（请根据您的数据库实际情况修改）：

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=movie_app_db
JWT_SECRET=your_super_secret_key_change_this
```

**设置数据库**:

1. 登录您的 MySQL 数据库。
2. 创建一个名为 `movie_app_db` 的数据库（或者您在 `.env` 中指定的名称）。
3. 根据项目需求导入相应的数据表结构（确保包含 `users`, `movies`, `comments`, `favorites` 等表）。

**启动后端服务器**:

```bash
node server.js
# 或者如果您安装了 nodemon
# npx nodemon server.js
```

服务器将在 `http://localhost:3001` 上运行。

### 3. 前端设置 (Frontend)

打开一个新的终端窗口，进入 `frontend` 目录并安装依赖：

```bash
cd frontend
npm install
```

**配置环境变量**:

在 `frontend` 目录下创建一个 `.env.local` 文件（可选，如果默认配置 `http://localhost:3001/api` 适用则不需要）：

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001/api
```

**启动前端开发服务器**:

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📂 项目结构

```
node-movie-app/
├── backend/                # 后端代码目录
│   ├── controllers/        # 控制器 (业务逻辑)
│   ├── routes/             # 路由定义 (API 端点)
│   ├── middleware/         # 中间件 (认证等)
│   ├── db.js               # 数据库连接配置
│   ├── server.js           # 后端入口文件
│   └── package.json        # 后端依赖配置
│
└── frontend/               # 前端代码目录
    ├── src/
    │   ├── app/            # Next.js 页面 (App Router)
    │   ├── components/     #通过 React 组件
    │   ├── context/        # React Context (如 AuthContext)
    │   ├── services/       # API 调用服务
    │   ├── styles/         # CSS 样式文件
    │   └── config/         # 配置文件
    ├── public/             # 静态资源
    └── package.json        # 前端依赖配置
```

## 📝 API 接口

主要的 API 端点包括：

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/movies` - 获取电影列表
- `GET /api/movies/:id` - 获取电影详情
- `POST /api/movies/:id/comments` - 添加评论
- `POST /api/movies/:id/favorite` - 收藏电影

## 📄 许可证

ISC License
