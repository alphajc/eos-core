# API设计
## 获取列表（ GET /filelist）
返回数据库中的文件列表

## 下载文件
将加密文件解密到制定的cache中
1. 批量下载（GET /files）
2. 单个下载（GET /files/:uuid）


## 上传文件（PUT /files）
将cache中的文件加密到文件区中
