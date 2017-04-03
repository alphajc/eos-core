# API设计
## 获取列表（ GET /filelist）
返回数据库中的文件列表
* 输入：

  参数名     | 是否必需 | 描述
  ----------|---------|------
  owner     |   否    | 当前登录用户，默认全部owner
  type      |   否    | 文件类型
* 输出：
    ```json
    {
      "filename":"filename",
      "extension_name": "ext_name",
      "uploaded_by":"username",
      "size":0,
      "type":"type",
      "visibility":"public"
      }
    ```
    
    参数名         | 描述
    --------------|----
    filename      | 文件名
    extension_name| 扩展名
    size          | 文件大小，单位KB<br>
    type          | [文件类型](https://zh.wikipedia.org/wiki/Category:%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F)
    visibility    | 文件可见性，取值为“public”和“owner”

## 下载文件
将加密文件解密到制定的cache中
1. 批量下载（GET /files）
    * 输入：
    * 输出：
  
2. 单个下载（GET /files/:uuid）
    * 输入：
    * 输出：
  
## 上传文件（POST /files）
将cache中的文件加密到文件区中
