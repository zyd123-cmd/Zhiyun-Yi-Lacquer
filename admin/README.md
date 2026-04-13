# 管理员后台说明

## 项目位置

- 管理员小程序工程目录：`D:\project\Zhiyun-Yi-Lacquer\admin`
- 管理员后台云函数目录：`D:\project\Zhiyun-Yi-Lacquer\admin\cloudfunctions\adminPortal`

## 已实现功能

- 管理员初始化
- 管理员登录/退出登录
- 文章发布
- 文章编辑
- 文章删除
- GLB 模型上传
- GLB 模型编辑
- GLB 模型删除
- 评论列表管理
- 评论删除

## 需要新建的云数据库集合

### `admin_users`

建议字段：

- `account`
- `passwordHash`
- `nickName`
- `role`
- `status`
- `openid`
- `createdAt`
- `updatedAt`
- `lastLoginAt`

### `admin_sessions`

建议字段：

- `adminId`
- `openid`
- `sessionToken`
- `createdAt`
- `updatedAt`
- `expiresAt`

## 已依赖的业务集合

- `articles`
- `artifact_models`
- `article_comments`
- `article_comment_likes`

## 使用方式

1. 在微信开发者工具中单独打开 `D:\project\Zhiyun-Yi-Lacquer\admin`
2. 确认 `project.config.json` 中的 `cloudfunctionRoot` 指向 `cloudfunctions/`
3. 上传并部署云函数 `adminPortal`
4. 第一次进入后台时，切到“初始化管理员”页签创建首个管理员
5. 初始化完成后，直接使用“管理员登录”进入后台

## 说明

- 管理员后台使用的是 `Vant Weapp`
- 模型上传仅允许 `glb` 格式
- 删除文章时会同步清理该文章下的评论和评论点赞记录
